#!/usr/bin/env python3
"""Pizza Ratto menu editor: a small password-protected web app (Python standard library only).

The owner edits menu.json, deli.json and merchandise.json in the browser. "Save and publish" applies the
changes to the app's own clone of the repo, runs build.py and tools/check.py there as a pre-flight (a failure
blocks the save), then commits and pushes only the changed JSON to TARGET_BRANCH. The repo's Pages workflow
(.github/workflows/pages.yml) rebuilds docs/ from that JSON and deploys it.

    python3 app.py               # run the server (settings come from env vars, see admin/README.md)
    python3 app.py hash          # print an ADMIN_PASSWORD_HASH for a password typed at the prompt
"""
import getpass
import hashlib
import hmac
import html
import json
import os
import re
import secrets
import subprocess
import sys
import threading
import time
import traceback
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlsplit

sys.path.insert(0, str(Path(__file__).resolve().parent))
import jsonfmt  # noqa: E402
import menu_ops  # noqa: E402

HERE = Path(__file__).resolve().parent
STATIC = HERE / "static"


def env(name, default=""):
    return os.environ.get(name, default).strip()


ADMIN_PATH = "/" + env("ADMIN_PATH").strip("/")
PASSWORD_HASH = env("ADMIN_PASSWORD_HASH")
TOKEN = env("GITHUB_TOKEN")
REPO_URL = env("REPO_URL", "https://github.com/nickjacksonza/pizza-ratto.git")
REPO_WEB = env("REPO_WEB", "https://github.com/nickjacksonza/pizza-ratto")
TARGET = env("TARGET_BRANCH", "main")
DRY_RUN = env("DRY_RUN", "0") == "1"
SITE_URL = env("SITE_URL", "https://pizzaratto.com")
GIT_NAME = env("GIT_USER_NAME", "Pizza Ratto menu editor")
GIT_EMAIL = env("GIT_USER_EMAIL")
DATA = Path(env("DATA_DIR", "/data"))
REPO = DATA / "repo"
PORT = int(env("PORT", "8080"))
TRUST_PROXY = env("TRUST_PROXY", "1") == "1"
SESSION_HOURS = float(env("SESSION_HOURS", "8"))
MAX_BODY = 64 * 1024
COOKIE = "__Host-pr_admin"

FOR_SALE = "site-references/for-sale"
GIT_TIMEOUT = 120
BUILD_TIMEOUT = 300

# Login limits: per client IP, and for everyone together (behind Traefik a forged IP header could dodge the first).
IP_MAX_FAILS, GLOBAL_MAX_FAILS, WINDOW, LOCKOUT = 5, 20, 15 * 60, 15 * 60


def log(msg):
    print(time.strftime("%Y-%m-%d %H:%M:%S"), scrub(str(msg)), flush=True)


def scrub(text):
    """Remove the token and the secret path from anything shown or logged."""
    if TOKEN:
        text = text.replace(TOKEN, "***")
    text = re.sub(r"(https?://)[^/@\s]+@", r"\1***@", text)
    if len(ADMIN_PATH) > 1:
        text = text.replace(ADMIN_PATH, "/<admin>")
    return text


# ---------------------------------------------------------------- password hashing (scrypt, no '$' so .env files are safe)

SCRYPT_N, SCRYPT_R, SCRYPT_P = 2 ** 15, 8, 1


def make_hash(password):
    salt = secrets.token_bytes(16)
    dk = hashlib.scrypt(password.encode(), salt=salt, n=SCRYPT_N, r=SCRYPT_R, p=SCRYPT_P, maxmem=128 * 1024 * 1024, dklen=32)
    return f"scrypt:{SCRYPT_N}:{SCRYPT_R}:{SCRYPT_P}:{salt.hex()}:{dk.hex()}"


def check_password(password, stored):
    try:
        algo, n, r, p, salt, want = stored.split(":")
        if algo != "scrypt":
            return False
        dk = hashlib.scrypt(password.encode(), salt=bytes.fromhex(salt), n=int(n), r=int(r), p=int(p),
                            maxmem=128 * 1024 * 1024, dklen=len(want) // 2)
        return hmac.compare_digest(dk.hex(), want)
    except (ValueError, TypeError):
        return False


# ---------------------------------------------------------------- sessions and login limits

SESSIONS = {}  # token -> {"csrf", "authed", "exp"}
S_LOCK = threading.Lock()
FAILS = {"global": [], "ip": {}}
LOCKED_UNTIL = {"global": 0, "ip": {}}


def new_session(authed):
    tok = secrets.token_urlsafe(32)
    life = SESSION_HOURS * 3600 if authed else 30 * 60
    with S_LOCK:
        now = time.time()
        for k in [k for k, v in SESSIONS.items() if v["exp"] < now]:
            del SESSIONS[k]
        if len(SESSIONS) > 2000:  # drop the oldest anonymous sessions
            anon = sorted((v["exp"], k) for k, v in SESSIONS.items() if not v["authed"])
            for _, k in anon[:1000]:
                del SESSIONS[k]
        SESSIONS[tok] = {"csrf": secrets.token_urlsafe(32), "authed": authed, "exp": now + life}
    return tok, int(life)


def get_session(tok):
    if not tok:
        return None
    with S_LOCK:
        s = SESSIONS.get(tok)
        if s and s["exp"] < time.time():
            del SESSIONS[tok]
            return None
        return s


def drop_session(tok):
    with S_LOCK:
        SESSIONS.pop(tok, None)


def lock_remaining(ip):
    now = time.time()
    with S_LOCK:
        return max(0, LOCKED_UNTIL["global"] - now, LOCKED_UNTIL["ip"].get(ip, 0) - now)


def record_fail(ip):
    now = time.time()
    with S_LOCK:
        g = [t for t in FAILS["global"] if t > now - WINDOW] + [now]
        FAILS["global"] = g
        mine = [t for t in FAILS["ip"].get(ip, []) if t > now - WINDOW] + [now]
        FAILS["ip"][ip] = mine
        if len(mine) >= IP_MAX_FAILS:
            LOCKED_UNTIL["ip"][ip] = now + LOCKOUT
            FAILS["ip"][ip] = []
        if len(g) >= GLOBAL_MAX_FAILS:
            LOCKED_UNTIL["global"] = now + LOCKOUT
            FAILS["global"] = []
        if len(FAILS["ip"]) > 5000:
            FAILS["ip"].clear()


def clear_fails(ip):
    with S_LOCK:
        FAILS["ip"].pop(ip, None)


# ---------------------------------------------------------------- git and the save pipeline

PIPE_LOCK = threading.Lock()


class StepError(Exception):
    """A failed step. `msg` is plain words for the owner, `detail` the scrubbed tool output."""

    def __init__(self, msg, detail=""):
        super().__init__(msg)
        self.msg, self.detail = msg, scrub(detail)[-4000:]


def run(args, cwd=None, timeout=GIT_TIMEOUT, check=True):
    env_ = dict(os.environ)
    env_.update({"GIT_ASKPASS": str(HERE / "askpass.sh"), "GIT_TERMINAL_PROMPT": "0", "LC_ALL": "C.UTF-8",
                 # Env config reaches git's helper processes too (a -c flag does not reach upload-pack).
                 "GIT_CONFIG_COUNT": "2", "GIT_CONFIG_KEY_0": "safe.directory", "GIT_CONFIG_VALUE_0": "*",
                 "GIT_CONFIG_KEY_1": "credential.helper", "GIT_CONFIG_VALUE_1": ""})
    env_.pop("ADMIN_PASSWORD_HASH", None)
    if args[0] != "git":
        env_.pop("GITHUB_TOKEN", None)  # build.py and check.py don't need it
    try:
        p = subprocess.run(args, cwd=cwd, env=env_, capture_output=True, text=True, timeout=timeout)
    except subprocess.TimeoutExpired:
        raise StepError(f"'{args[0]} {args[1] if len(args) > 1 else ''}' took too long and was stopped.")
    if check and p.returncode != 0:
        raise StepError(f"'{' '.join(args[:2])}' failed.", p.stdout + p.stderr)
    return p


def git(*args, check=True, timeout=GIT_TIMEOUT):
    return run(["git", *args], cwd=REPO, check=check, timeout=timeout)


def ensure_clone():
    if (REPO / ".git").exists():
        return
    DATA.mkdir(parents=True, exist_ok=True)
    log(f"cloning {REPO_URL} into {REPO}")
    try:
        run(["git", "clone", "--quiet", "--branch", TARGET, REPO_URL, str(REPO)], timeout=600)
    except StepError as e:
        raise StepError("Couldn't download the site from GitHub. Check GITHUB_TOKEN and REPO_URL.", e.detail)


def sync():
    """Fetch and hard-reset the app's own clone to origin/TARGET. Discards anything local."""
    ensure_clone()
    try:
        git("fetch", "--quiet", "--prune", "origin", f"+refs/heads/{TARGET}:refs/remotes/origin/{TARGET}")
    except StepError as e:
        raise StepError("Couldn't fetch the latest site from GitHub.", e.detail)
    git("checkout", "--quiet", "--force", "-B", TARGET, f"origin/{TARGET}")
    git("reset", "--quiet", "--hard", f"origin/{TARGET}")
    git("clean", "-ffdxq")


def read_docs():
    docs, raws = {}, {}
    for key, name in menu_ops.FILES.items():
        p = REPO / FOR_SALE / name
        if p.exists():
            raws[key] = p.read_text(encoding="utf-8")
            docs[key] = json.loads(raws[key])
    if "menu" not in docs:
        raise StepError(f"{FOR_SALE}/menu.json is missing on branch {TARGET}. Has the menu PR been merged yet?")
    return docs, raws


def photo_map(docs):
    return {key: {it["id"]: bool(it.get("image")) and (REPO / it["image"]).is_file()
                  for s in d["sections"] for g in s["groups"] for it in g["items"] if isinstance(it.get("id"), str)}
            for key, d in docs.items()}


def build_and_check():
    p = run([sys.executable, "build.py"], cwd=REPO, timeout=BUILD_TIMEOUT, check=False)
    out = p.stdout + p.stderr
    if p.returncode != 0:
        lines = [l for l in out.strip().splitlines() if l.strip()]
        last = lines[-1] if lines else "no output"
        raise StepError(f"The site build failed, so nothing was published. The build said: {last}", out)
    warnings = []
    m = re.search(r"\n(\d+) menu images named in the JSON are not on disk.*?:\n((?:\s+\S.*\n?)+)", out)
    if m:
        warnings.append(f"{m.group(1)} items have no photo yet, so the site shows the 'photo coming hot' tile for them.")
    c = run([sys.executable, "tools/check.py"], cwd=REPO, timeout=BUILD_TIMEOUT, check=False)
    if c.returncode != 0:
        fails = [l[5:] for l in (c.stdout + c.stderr).splitlines() if l.startswith("FAIL ")]
        raise StepError("The site check found problems, so nothing was published: " + "; ".join(fails[:5] or ["see details"]),
                        c.stdout + c.stderr)
    return warnings


def apply_and_commit(ops):
    """sync -> apply ops -> write JSON -> pre-flight build + check -> commit the JSON only. Returns (sha, notes, warnings) or (None, ...) if nothing changed."""
    sync()
    docs, raws = read_docs()
    changed, notes = menu_ops.apply_ops(docs, ops)
    paths = []
    for key in sorted(changed):
        text = jsonfmt.dumps(docs[key], jsonfmt.blank_after_ids(raws[key]))
        if text != raws[key]:
            (REPO / FOR_SALE / menu_ops.FILES[key]).write_text(text, encoding="utf-8")
            paths.append(f"{FOR_SALE}/{menu_ops.FILES[key]}")
    if not paths:
        return None, notes, []
    warnings = build_and_check()
    git("checkout", "--quiet", "--", "docs", check=False)  # the pre-flight build output is not committed; the Pages workflow builds its own
    git("clean", "-ffdq", "--", "docs", check=False)
    git("add", "--", *paths)
    if git("diff", "--cached", "--quiet", check=False).returncode == 0:
        return None, notes, warnings
    summary = "; ".join(notes[:3]) + (f" and {len(notes) - 3} more" if len(notes) > 3 else "")
    subject = f"Menu update via editor: {summary}"
    if len(subject) > 120:
        subject = subject[:117].rstrip() + "..."
    body = "\n".join(f"- {n}" for n in notes)
    ident = ["-c", f"user.name={GIT_NAME}", "-c", f"user.email={GIT_EMAIL or 'menu-editor@invalid'}"]
    git(*ident, "commit", "--quiet", "--no-verify", "-m", subject, "-m", body)
    sha = git("rev-parse", "HEAD").stdout.strip()
    return sha, notes, warnings


def publish(ops):
    """The whole save. Returns a dict for the browser."""
    if not PIPE_LOCK.acquire(blocking=False):
        return {"ok": False, "error": "Another save is still running. Wait a moment and try again."}
    try:
        for attempt in (1, 2):
            sha, notes, warnings = apply_and_commit(ops)
            if sha is None:
                return {"ok": False, "error": "Nothing changed, so there was nothing to publish."}
            if DRY_RUN:
                log(f"dry run: committed {sha[:8]} locally, not pushed")
                return {"ok": True, "dry_run": True, "sha": sha, "notes": notes, "warnings": warnings}
            p = git("push", "--quiet", "origin", f"HEAD:refs/heads/{TARGET}", check=False)
            if p.returncode == 0:
                log(f"pushed {sha[:8]} to {TARGET}")
                return {"ok": True, "sha": sha, "notes": notes, "warnings": warnings,
                        "commit_url": f"{REPO_WEB}/commit/{sha}", "site_url": SITE_URL}
            out = p.stdout + p.stderr
            rejected = re.search(r"rejected|non-fast-forward|fetch first", out)
            if attempt == 1 and rejected:
                log("push rejected, refetching and retrying once")
                continue
            raise StepError("GitHub refused the update, so the change is not live. Try again in a minute.", out)
    except menu_ops.OpError as e:
        return {"ok": False, "error": str(e)}
    except StepError as e:
        log(f"save failed: {e.msg}")
        return {"ok": False, "error": e.msg, "detail": e.detail}
    except Exception:
        log("save crashed:\n" + traceback.format_exc())
        return {"ok": False, "error": "Something unexpected went wrong, so nothing was published."}
    finally:
        PIPE_LOCK.release()


def load_data():
    """Fresh copy of the three files for the editor."""
    with PIPE_LOCK:
        sync()
        docs, _ = read_docs()
        head = git("rev-parse", "--short", "HEAD").stdout.strip()
    return {"ok": True, "files": {k: {"label": menu_ops.LABELS[k], "data": d} for k, d in docs.items()},
            "photos": photo_map(docs), "target": TARGET, "dry_run": DRY_RUN, "head": head, "site_url": SITE_URL}


# ---------------------------------------------------------------- HTTP

CSP = ("default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; "
       "connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'")


def page(title, body, csrf=""):
    p = html.escape(ADMIN_PATH)
    return f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="referrer" content="no-referrer">
<meta name="csrf" content="{html.escape(csrf)}">
<meta name="base" content="{p}">
<title>{html.escape(title)}</title>
<link rel="stylesheet" href="{p}/static/tokens.css">
<link rel="stylesheet" href="{p}/static/app.css">
</head><body>{body}</body></html>"""


def login_page(csrf, message=""):
    msg = f'<p class="msg msg-err" role="alert">{html.escape(message)}</p>' if message else ""
    p = html.escape(ADMIN_PATH)
    return page("Menu editor sign in", f"""
<main class="login"><h1>Pizza Ratto<small>menu editor</small></h1>{msg}
<form method="post" action="{p}/login">
<input type="hidden" name="csrf" value="{html.escape(csrf)}">
<label>Password<input type="password" name="password" autocomplete="current-password" required autofocus></label>
<button class="btn btn-primary" type="submit">Sign in</button></form></main>""")


def editor_page(csrf):
    p = html.escape(ADMIN_PATH)
    return page("Menu editor", f"""
<header class="top"><h1>Pizza Ratto <small>menu editor</small></h1>
<form method="post" action="{p}/logout"><input type="hidden" name="csrf" value="{html.escape(csrf)}"><button class="link" type="submit">Sign out</button></form></header>
<div id="status" class="status" aria-live="polite"></div>
<nav id="tabs" class="tabs" role="tablist"></nav>
<main id="app"><p class="loading">Loading the menu…</p></main>
<div id="bar" class="bar" hidden><span id="count"></span><button id="discard" class="btn" type="button">Discard</button><button id="save" class="btn btn-primary" type="button">Save and publish</button></div>
<dialog id="confirm"><form method="dialog"><h2>Ready to publish</h2><ul id="confirm-list"></ul>
<p class="hint" id="confirm-note"></p>
<div class="row"><button class="btn" value="cancel">Cancel</button><button class="btn btn-primary" value="ok" id="confirm-ok">Publish now</button></div></form></dialog>
<script src="{p}/static/app.js"></script>""", csrf)


FONT_RE = re.compile(r"^[a-z0-9-]+\.woff2$")
STATIC_FILES = {"app.js": "application/javascript", "app.css": "text/css"}


class Handler(BaseHTTPRequestHandler):
    server_version = "editor"
    sys_version = ""
    protocol_version = "HTTP/1.1"

    def log_message(self, fmt, *args):  # never log query strings, bodies or the secret path
        path = urlsplit(self.path).path
        log(f"{self.client_ip()} {self.command} {path} {args[1] if len(args) > 1 else ''}")

    def client_ip(self):
        if TRUST_PROXY:
            real = self.headers.get("X-Real-Ip", "").strip()
            if real:
                return real[:64]
        return self.client_address[0]

    # -- responses
    def send(self, status, body=b"", ctype="text/html; charset=utf-8", headers=()):
        if isinstance(body, str):
            body = body.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("X-Robots-Tag", "noindex, nofollow")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Content-Security-Policy", CSP)
        for k, v in headers:
            self.send_header(k, v)
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)

    def json(self, status, obj):
        self.send(status, json.dumps(obj), "application/json; charset=utf-8")

    def not_found(self):
        self.send(404, "Not found", "text/plain; charset=utf-8")

    def redirect(self, to, headers=()):
        self.send(303, "", headers=[("Location", to), *headers])

    def cookie_header(self, tok, max_age):
        return ("Set-Cookie", f"{COOKIE}={tok}; Path=/; Max-Age={max_age}; HttpOnly; Secure; SameSite=Strict")

    # -- request helpers
    def route(self):
        """Path inside ADMIN_PATH ('' or '/...'), or None for anything outside it."""
        path = urlsplit(self.path).path
        if len(ADMIN_PATH) < 2 or not (path == ADMIN_PATH or path.startswith(ADMIN_PATH + "/")):
            return None
        return path[len(ADMIN_PATH):]

    def session(self):
        raw = self.headers.get("Cookie", "")
        for part in raw.split(";"):
            k, _, v = part.strip().partition("=")
            if k == COOKIE:
                return v, get_session(v)
        return None, None

    def body(self):
        try:
            n = int(self.headers.get("Content-Length", ""))
        except ValueError:
            return None
        if n < 0 or n > MAX_BODY:
            return None
        return self.rfile.read(n)

    def same_origin(self):
        site = self.headers.get("Sec-Fetch-Site")
        if site and site not in ("same-origin", "none"):
            return False
        origin = self.headers.get("Origin")
        # Browsers send "Origin: null" on form posts under Referrer-Policy no-referrer; the CSRF token still applies.
        if not origin or origin == "null":
            return True
        return urlsplit(origin).netloc == self.headers.get("Host", "")

    # -- methods
    def do_HEAD(self):
        self.do_GET()

    def do_GET(self):
        r = self.route()
        if r is None:
            return self.not_found()
        if r == "":
            return self.redirect(ADMIN_PATH + "/")
        if r.startswith("/static/"):
            name = r[len("/static/"):]
            if name == "tokens.css":
                f = REPO / "css" / "tokens.css"
                if not f.is_file():
                    return self.send(200, "", "text/css")
                css = f.read_text(encoding="utf-8").replace("../fonts/", "fonts/")
                return self.send(200, css, "text/css; charset=utf-8")
            if name.startswith("fonts/") and FONT_RE.match(name[6:]) and (REPO / "fonts" / name[6:]).is_file():
                return self.send(200, (REPO / "fonts" / name[6:]).read_bytes(), "font/woff2")
            if name in STATIC_FILES:
                return self.send(200, (STATIC / name).read_bytes(), STATIC_FILES[name] + "; charset=utf-8")
            return self.not_found()
        tok, s = self.session()
        if r == "/":
            if s and s["authed"]:
                return self.send(200, editor_page(s["csrf"]))
            if not s:
                tok, age = new_session(False)
                s = get_session(tok)
                return self.send(200, login_page(s["csrf"]), headers=[self.cookie_header(tok, age)])
            return self.send(200, login_page(s["csrf"]))
        if r == "/api/data":
            if not (s and s["authed"]):
                return self.json(401, {"ok": False, "error": "Your session has ended. Sign in again."})
            try:
                return self.json(200, load_data())
            except StepError as e:
                log(f"load failed: {e.msg}")
                return self.json(502, {"ok": False, "error": e.msg, "detail": e.detail})
        return self.not_found()

    def do_POST(self):
        r = self.route()
        if r is None:
            return self.not_found()
        raw = self.body()
        if raw is None:
            self.close_connection = True  # the unread body must not be parsed as the next request
            return self.send(413, "Request too large or missing length.", "text/plain; charset=utf-8")
        tok, s = self.session()
        if not self.same_origin():
            return self.send(403, "Cross-site request refused.", "text/plain; charset=utf-8")

        if r in ("/login", "/logout"):
            form = parse_qs(raw.decode("utf-8", "replace"), max_num_fields=5)
            csrf = (form.get("csrf") or [""])[0]
            if not s or not hmac.compare_digest(csrf.encode(), s["csrf"].encode()):
                return self.send(403, "Your form expired. Go back, reload the page and try again.", "text/plain; charset=utf-8")
            if r == "/logout":
                drop_session(tok)
                return self.redirect(ADMIN_PATH + "/", [self.cookie_header("", 0)])
            ip = self.client_ip()
            wait = lock_remaining(ip)
            if wait:
                return self.send(429, login_page(s["csrf"], f"Too many wrong passwords. Try again in {int(wait // 60) + 1} minutes."),
                                 headers=[("Retry-After", str(int(wait)))])
            password = (form.get("password") or [""])[0]
            if PASSWORD_HASH and password and len(password) <= 256 and check_password(password, PASSWORD_HASH):
                clear_fails(ip)
                drop_session(tok)
                new_tok, age = new_session(True)
                log(f"login ok from {ip}")
                return self.redirect(ADMIN_PATH + "/", [self.cookie_header(new_tok, age)])
            record_fail(ip)
            log(f"login failed from {ip}")
            time.sleep(0.5)
            return self.send(401, login_page(s["csrf"], "That password is not right."))

        if r == "/api/publish":
            if not (s and s["authed"]):
                return self.json(401, {"ok": False, "error": "Your session has ended. Sign in again."})
            sent = self.headers.get("X-CSRF-Token", "")
            if not hmac.compare_digest(sent.encode(), s["csrf"].encode()):
                return self.json(403, {"ok": False, "error": "Security check failed. Reload the page and try again."})
            if not self.headers.get("Content-Type", "").startswith("application/json"):
                return self.json(415, {"ok": False, "error": "Bad request."})
            try:
                payload = json.loads(raw)
            except ValueError:
                return self.json(400, {"ok": False, "error": "Bad request."})
            ops = payload.get("ops") if isinstance(payload, dict) else None
            result = publish(ops)
            return self.json(200 if result["ok"] else 422, result)
        return self.not_found()

    def do_PUT(self):
        self.not_found()

    do_DELETE = do_PATCH = do_OPTIONS = do_PUT


def main():
    if len(sys.argv) > 1 and sys.argv[1] == "hash":
        pw = getpass.getpass("Owner password: ") if sys.stdin.isatty() else sys.stdin.readline().rstrip("\n")
        if len(pw) < 12:
            sys.exit("Use at least 12 characters.")
        if sys.stdin.isatty() and getpass.getpass("Again: ") != pw:
            sys.exit("The two passwords differ.")
        print(make_hash(pw))
        return
    problems = []
    if len(ADMIN_PATH) < 17 or not re.fullmatch(r"/[A-Za-z0-9_-]+", ADMIN_PATH):
        problems.append("ADMIN_PATH must be set to a random string of at least 16 letters, digits, - or _ (e.g. from `openssl rand -hex 16`).")
    if not PASSWORD_HASH.startswith("scrypt:"):
        problems.append("ADMIN_PASSWORD_HASH is missing. Make one with `python3 app.py hash`.")
    if not DRY_RUN and not TOKEN:
        problems.append("GITHUB_TOKEN is missing (or set DRY_RUN=1).")
    if not GIT_EMAIL:
        problems.append("GIT_USER_EMAIL is missing.")
    if problems:
        for p in problems:
            log("config: " + p)
        sys.exit(1)
    try:
        with PIPE_LOCK:
            sync()
        log(f"repo ready on {TARGET}")
    except StepError as e:
        log(f"startup sync failed (will retry on first load): {e.msg} {e.detail}")
    log(f"listening on :{PORT}, target={TARGET}, dry_run={DRY_RUN}")
    ThreadingHTTPServer(("0.0.0.0", PORT), Handler).serve_forever()


if __name__ == "__main__":
    main()
