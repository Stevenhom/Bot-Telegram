# Utilise une image Node.js légère
FROM node:22-slim

# Installe les dépendances nécessaires à Puppeteer
RUN apt-get update && apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    xdg-utils \
    libu2f-udev \
    libvulkan1 \
    chromium \
    chromium-driver \
    google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Installer Puppeteer sans dépendances inutiles
RUN npm install puppeteer --omit=dev

# Vérifier les navigateurs installés
RUN npx puppeteer browsers list
RUN which chromium && which chromium-browser && which google-chrome-stable
RUN chmod +x /usr/bin/chromium

RUN which chromium-browser && which chromium && which google-chrome-stable

# Crée le répertoire de travail
WORKDIR /app

# Copie package.json et package-lock.json pour installer les dépendances
COPY package*.json ./
RUN npm install --omit=dev

# Copie le reste du code
COPY . .

# Expose le port si ton application écoute (utile pour health check)
EXPOSE 10000

# Commande de démarrage
CMD ["node", "bot.js"]