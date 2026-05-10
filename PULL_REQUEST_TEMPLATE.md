# Pull Request: feature/initial-mvp → main

MVP: initial project structure and Telegram-based publisher (MVP)

This PR introduces the initial MVP for the Mohey4ADS project:

- Node.js + Express backend
- Simple web UI for uploading CSV/JSON ads
- Telegram publisher using Bot API
- Logging of publish attempts in logs/posts.log (JSON-lines)
- Dockerfile, sample CSV/JSON, .env.example, README.md

What to test:
- Follow README to run locally, set TELEGRAM_BOT_TOKEN and TELEGRAM_DEFAULT_CHAT_ID in .env
- Upload sample.csv or sample.json and use the UI to publish

Notes:
- No secrets are committed. Please store real tokens in .env locally or GitHub Secrets for CI.
- This PR is an MVP for Telegram only. Additional platforms can be added later.
