#!/bin/sh
# Git calls this for HTTPS credentials. The token stays in the environment: never in .git/config, a URL or the process list.
case "$1" in
  Username*) echo "x-access-token" ;;
  *) echo "$GITHUB_TOKEN" ;;
esac
