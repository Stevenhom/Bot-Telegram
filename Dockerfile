FROM node:20-slim

# Installer les dépendances minimales pour Chrome
RUN apt-get update && \
    apt-get install -y wget gnupg && \
    wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg && \
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list && \
    apt-get update && \
    apt-get install -y google-chrome-stable && \
    rm -rf /var/lib/apt/lists/*

# Définir les variables d'environnement
ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/google-chrome" \
    NODE_ENV="production"

WORKDIR /app

# Copier et installer les dépendances
COPY package*.json ./
RUN npm install --omit=dev

# Copier le code source
COPY . .

# Exposer le port
EXPOSE 10000

# Commande de démarrage
CMD ["node", "bot.js"]