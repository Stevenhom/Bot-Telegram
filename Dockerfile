# Étape 1 : Image de base légère avec Node.js
FROM node:20-slim

# Étape 2 : Installer les dépendances nécessaires à Puppeteer/Chrome
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    unzip \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libxss1 \
    libgbm1 \
    ca-certificates \
    xdg-utils \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Étape 3 : Dossier de travail
WORKDIR /app

# Étape 4 : Copier les fichiers package.json
COPY package*.json ./

# Étape 5 : Variables Puppeteer
ENV PUPPETEER_SKIP_DOWNLOAD=false
ENV PUPPETEER_CACHE_DIR=/app/.cache/puppeteer

# Étape 6 : Dossier cache Puppeteer
RUN mkdir -p /app/.cache/puppeteer

# Étape 7 : Installer les dépendances + Chromium
RUN npm install --legacy-peer-deps && npm cache clean --force && \
    npx puppeteer browsers install chrome

# Étape 8 : Copier le reste du code
COPY . .

# Étape 9 : Port (si applicable)
# EXPOSE 3000

# Étape 10 : Commande par défaut
CMD ["node", "index.js"]
