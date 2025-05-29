# Utilise une image Node.js légère
FROM node:22-slim

# Install minimal dependencies for Puppeteer
RUN apt-get update && apt-get install -y \
        ca-certificates \
        fonts-liberation \
        libasound2 \
        libatk-bridge2.0-0 \
        libatk1.0-0 \
        libcairo2 \
        libcups2 \
        libdbus-1-3 \
        libexpat1 \
        libfontconfig1 \
        libgbm1 \
        libgdk-pixbuf2.0-0 \
        libglib2.0-0 \
        libgtk-3-0 \
        libnspr4 \
        libnss3 \
        libpango-1.0-0 \    
        libpangocairo-1.0-0 \
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
        --no-install-recommends && \
        rm -rf /var/lib/apt/lists/*

# Installer Puppeteer sans dépendances inutiles
RUN npm install puppeteer

# Crée le répertoire de travail
WORKDIR /app

# Copie package.json et package-lock.json pour installer les dépendances
COPY package*.json ./

# Copie le reste du code
COPY . .

# Expose le port si ton application écoute (utile pour health check)
EXPOSE 10000

# Commande de démarrage
CMD ["node", "bot.js"]