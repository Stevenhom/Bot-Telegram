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
    nss-tools \
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

# Étape 4 : Installation des dépendances Node
COPY package*.json ./
RUN mkdir -p /app/.cache/puppeteer && \
    npm install --legacy-peer-deps && \
    npx puppeteer browsers install chrome

# Étape 5 : Configuration SSL BrightData
COPY brightdata.crt /usr/local/share/ca-certificates/
RUN mkdir -p $HOME/.pki/nssdb && \
    update-ca-certificates && \
    yes | certutil -d sql:$HOME/.pki/nssdb -N --empty-password && \
    certutil -d sql:$HOME/.pki/nssdb -A -t "C,," -n "brightdata" -i /usr/local/share/ca-certificates/brightdata.crt

# Étape 6 : Copie du code applicatif
COPY . .

# Étape 7 : Script de démarrage
RUN chmod +x /app/wait-for-selector.js
CMD ["xvfb-run", "--server-args=-screen 0 1280x720x24", "node", "--trace-warnings", "bot.js"]
