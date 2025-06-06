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
    --no-install-recommends && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Étape 3 : Configuration de l'environnement
WORKDIR /app
ENV PUPPETEER_SKIP_DOWNLOAD=false
ENV PUPPETEER_EXECUTABLE_PATH=/app/.cache/puppeteer/chrome/linux-136.0.7103.94/chrome-linux64/chrome
ENV DISPLAY=:99
ENV TZ=Europe/Paris
ENV RENDER=true


# Étape 4 : Copie des fichiers package.json et package-lock.json
COPY package*.json ./

# Étape 5 : Installation des dépendances Node.js
RUN npm install --production

# Étape 6 : Copie du reste du code de l'application
COPY . .

# Étape 7 : Définition de la commande de démarrage
CMD ["node", "bot.js"]
