# Étape 1 : Image de base légère avec Node.js
FROM node:20-slim

# Étape 2 : Installer les dépendances nécessaires à Puppeteer/Chrome et les outils de certificat
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
    nss-tools --no-install-recommends && \
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

# Étape 8 : Copier le certificat Bright Data
COPY "BrightData SSL certificate (port 33335).crt" /usr/local/share/ca-certificates/

# Étape 9 : Mettre à jour les certificats CA du système et importer dans NSS
ENV HOME /tmp
RUN update-ca-certificates && \
    mkdir -p $HOME/.pki/nssdb && \
    chmod 700 $HOME/.pki/nssdb && \
    certutil -d $HOME/.pki/nssdb -N --empty-password && \
    certutil -d sql:$HOME/.pki/nssdb -A -t "C,," -n "BrightData CA" -i /usr/local/share/ca-certificates/brightdata-ca.crt

# Étape 10 : Copier le reste du code de l'application
COPY . .

# Étape 11 : Port (si applicable)

# Étape 12 : Commande par défaut pour démarrer votre bot
CMD ["node", "bot.js"] 