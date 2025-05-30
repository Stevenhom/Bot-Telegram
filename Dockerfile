# Étape 1 : Définir une image de base
FROM node:20-slim

# Étape 2 : Installer les dépendances nécessaires à Puppeteer/Chrome
RUN apt-get update && apt-get install -y \
    wget \
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
    xdg-utils \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Étape 3 : Définir le dossier de travail
WORKDIR /app

# Étape 4 : Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Étape 5 : Définir les variables Puppeteer
ENV PUPPETEER_SKIP_DOWNLOAD=false
ENV PUPPETEER_CACHE_DIR=/app/.cache/puppeteer

# Étape 6 : Créer le dossier cache pour Puppeteer
RUN mkdir -p /app/.cache/puppeteer

# Étape 7 : Installer les dépendances Node.js et forcer le téléchargement de Chromium
RUN npm install && npx puppeteer browsers install chrome

# Étape 8 : Copier le reste du code
COPY . .

# Étape 9 : Commande par défaut (à adapter)
CMD ["node", "index.js"]
