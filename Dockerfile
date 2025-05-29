# Étape 1 : Utiliser une image légère de Node.js
FROM node:22-slim

# Étape 2 : Installer les dépendances système nécessaires à Puppeteer
RUN apt-get update && apt-get install -y \
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
    ca-certificates \
    wget \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Étape 3 : Définir le répertoire de travail
WORKDIR /app

# Étape 4 : Copier les fichiers nécessaires pour npm install
COPY package*.json ./

# Étape 5 : Installer les dépendances Node.js
RUN npm install

# Étape 6 : Copier le reste de l'application
COPY . .

# (Optionnel) Exposer un port (au cas où tu utilises express)
EXPOSE 10000

# Étape 7 : Lancer le bot
CMD ["node", "bot.js"]
