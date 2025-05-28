# Utilise une image Node.js de base (choisis la version de Node.js que tu utilises)
# Exemples : node:18-slim, node:20-slim, node:22-slim
FROM node:20-slim

# Met à jour les paquets et installe les dépendances nécessaires à Chromium.
# Ces paquets sont essentiels pour que Chromium puisse fonctionner dans un environnement minimal.
RUN apt-get update && apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libnspr4 \
    libnss3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils \
    libgtk-3-0 \
    libxss1 \
    libgbm-dev \
    # Ajout d'autres paquets fréquemment nécessaires pour Puppeteer
    gconf-service \
    libcurl4-gnutls-dev \
    libexif-dev \
    libgdk-pixbuf2.0-dev \
    libgl1-mesa-dev \
    libsecret-1-dev \
    libvulkan1 \
    libxcomposite1 \
    libxdamage1 \
    libxi6 \
    libxtst6 \
    # Nettoyage pour réduire la taille de l'image Docker
    && rm -rf /var/lib/apt/lists/*

# Installe Google Chrome Stable directement.
# C'est l'étape qui installe le navigateur que Puppeteer va utiliser.
# Cela rend @sparticuz/chromium inutile, mais tu pourrais le laisser si tu veux juste installer puppeteer-core
# et laisser @sparticuz/chromium gérer le executablePath avec ses propres arguments.
# Cependant, pour la fiabilité, installer Chrome directement est souvent mieux.
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable

# Définit le chemin de l'exécutable Chrome pour Puppeteer.
# C'est la variable d'environnement que Puppeteer (via puppeteer-core) regarde par défaut.
# Si tu gardes @sparticuz/chromium, cette ligne sera redondante mais inoffensive.
# Si tu passes à puppeteer (le paquet complet) sans @sparticuz/chromium, c'est utile.
ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/google-chrome-stable"

# Crée le répertoire de travail pour l'application dans le conteneur
WORKDIR /app

# Copie package.json et package-lock.json pour installer les dépendances Node.js
# Cette étape est faite avant de copier le reste du code pour optimiser la mise en cache de Docker
COPY package*.json ./
RUN npm install --omit=dev # Installe seulement les dépendances de production

# Copie tout le reste du code source de ton projet dans le conteneur
COPY . .

# Expose le port si ton application écoute sur un port (par exemple, pour un serveur web ou un webhook)
# Si ton bot n'est que client (long polling), tu n'en as pas besoin.
EXPOSE 3000

# Commande de démarrage de ton application
# Remplace "bot.js" par le nom de ton fichier de démarrage principal (ex: index.js, app.js)
CMD ["node", "bot.js"]