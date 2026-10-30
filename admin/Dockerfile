# Pizza Ratto menu editor. Build context: the repo's admin/ folder.
FROM python:3.12-slim

RUN apt-get update \
 && apt-get install -y --no-install-recommends git ca-certificates \
 && rm -rf /var/lib/apt/lists/* \
 && useradd --uid 10001 --create-home editor \
 && mkdir -p /data && chown editor:editor /data

WORKDIR /app
COPY --chown=root:root app.py jsonfmt.py menu_ops.py askpass.sh ./
COPY --chown=root:root static ./static
RUN chmod 755 askpass.sh

USER editor
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 HOME=/home/editor
VOLUME ["/data"]
EXPOSE 8080
CMD ["python3", "/app/app.py"]
