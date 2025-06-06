# Étape 1 : Image de base avec Node.js (version slim pour équilibre taille/compatibilité)
FROM node:20-slim

# Étape 2 : Installation des dépendances système nécessaires
RUN apt-get update && apt-get install -y \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libpangocairo-1.0-0 \
    libxtst6 \
    ca-certificates \
    fonts-liberation \
    xvfb \
    wget \
    unzip \
    --no-install-recommends && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Étape 3 : Téléchargement manuel de Chromium compatible avec Puppeteer
RUN mkdir -p /app/.cache/puppeteer/chrome/linux-136.0.7103.94/ && \
    wget -O /tmp/chromium.zip https://storage.googleapis.com/chrome-for-testing-public/136.0.7103.94/linux64/chrome-linux64.zip && \
    unzip /tmp/chromium.zip -d /tmp/ && \
    mv /tmp/chrome-linux64 /app/.cache/puppeteer/chrome/linux-136.0.7103.94/ && \
    rm -rf /tmp/chromium.zip

# Étape 4 : Configuration de l'environnement
WORKDIR /app
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/app/.cache/puppeteer/chrome/linux-136.0.7103.94/chrome-linux64/chrome
ENV DISPLAY=:99
ENV TZ=Europe/Paris
ENV RENDER=true

# Étape 5 : Copie des fichiers package.json et package-lock.json
COPY package*.json ./

# Étape 6 : Installation des dépendances Node.js
RUN npm install --production

# Étape 7 : Copie du reste du code de l'application
COPY . .

# Étape 8 : Définition de la commande de démarrage
CMD ["node", "bot.js"]
