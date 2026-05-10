# Dockerfile

FROM node:18-slim

# Install deps required by puppeteer (optional). These keep image size moderate but enough for Chromium if installed.
RUN apt-get update && apt-get install -y ca-certificates fonts-liberation libasound2 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libgbm1 libnspr4 libnss3 libx11-xcb1 libxcomposite1 libxdamage1 libxrandr2 xdg-utils --no-install-recommends && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package.json
RUN npm install --omit=dev

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
