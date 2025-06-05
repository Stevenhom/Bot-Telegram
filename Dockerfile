# Étape 1 : Image de base légère avec Node.js
FROM node:20-slim

# Étape 2 : Installer les dépendances nécessaires à Puppeteer/Chrome et les outils de certificat
# Inclut 'nss-tools' pour certutil et 'ca-certificates' pour la gestion des CA système.
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

# Étape 3 : Définir le dossier de travail dans le conteneur
WORKDIR /app

# Étape 4 : Copier le fichier package.json et package-lock.json pour installer les dépendances
COPY package*.json ./

# Étape 5 : Variables d'environnement pour Puppeteer
ENV PUPPETEER_SKIP_DOWNLOAD=false
ENV PUPPETEER_CACHE_DIR=/app/.cache/puppeteer

# Étape 6 : Créer le dossier de cache de Puppeteer
RUN mkdir -p /app/.cache/puppeteer

# Étape 7 : Installer les dépendances Node.js et télécharger Chromium via Puppeteer
RUN npm install --legacy-peer-deps && npm cache clean --force && \
    npx puppeteer browsers install chrome

# Étape 8 : Copier le certificat Bright Data dans le système de fichiers du conteneur
COPY brightdata.crt /usr/local/share/ca-certificates/

# Étape 9 : Mettre à jour les certificats de l'autorité de certification système et importer dans NSS
ENV HOME /tmp
RUN update-ca-certificates && \
    mkdir -p $HOME/.pki/nssdb && \
    chmod 700 $HOME/.pki/nssdb && \
    certutil -d $HOME/.pki/nssdb -N --empty-password && \
    certutil -d sql:$HOME/.pki/nssdb -A -t "C,," -n "BrightData CA" -i /usr/local/share/ca-certificates/brightdata.crt

# Étape 10 : Copier le reste du code de l'application dans le conteneur
COPY . .

# Étape 11 : Définir le port si votre application web écoute les requêtes entrantes
# EXPOSE 10000

# Étape 12 : Commande par défaut pour démarrer votre bot
CMD ["node", "bot.js"]
