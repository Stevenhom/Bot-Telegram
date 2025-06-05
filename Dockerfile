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
    nss-tools \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Étape 3 : Définir le dossier de travail
WORKDIR /app

# Étape 4 : Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Étape 5 : Variables d'environnement Puppeteer
ENV PUPPETEER_SKIP_DOWNLOAD=false
ENV PUPPETEER_CACHE_DIR=/app/.cache/puppeteer

# Étape 6 : Créer le dossier de cache
RUN mkdir -p /app/.cache/puppeteer

# Étape 7 : Installer les dépendances Node.js et télécharger Chrome pour Puppeteer
RUN npm install --legacy-peer-deps && npm cache clean --force && \
    npx puppeteer browsers install chrome

# Étape 8 : Ajouter le certificat BrightData
COPY brightdata.crt /usr/local/share/ca-certificates/

# Étape 9 : Mettre à jour les CA et ajouter le certificat dans la base NSS
ENV HOME=/tmp
RUN update-ca-certificates && \
    mkdir -p $HOME/.pki/nssdb && \
    chmod 700 $HOME/.pki/nssdb && \
    certutil -d $HOME/.pki/nssdb -N --empty-password && \
    certutil -d sql:$HOME/.pki/nssdb -A -t "C,," -n "BrightData CA" -i /usr/local/share/ca-certificates/brightdata.crt

# Étape 10 : Copier le code source
COPY . .

# Étape 11 : Exposer un port (si nécessaire)
# EXPOSE 10000

# Étape 12 : Commande de démarrage
CMD ["node", "bot.js"]
