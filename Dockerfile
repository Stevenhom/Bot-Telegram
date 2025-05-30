# Prérequis : assure-toi que tu installes les deps Puppeteer/Chrome
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
    --no-install-recommends

# Définir les variables Puppeteer
ENV PUPPETEER_SKIP_DOWNLOAD=false
ENV PUPPETEER_CACHE_DIR=/app/.cache/puppeteer

# Créer le dossier cache
RUN mkdir -p /app/.cache/puppeteer

# Installer les dépendances et forcer le téléchargement de Chromium
RUN npm install && npx puppeteer browsers install chrome
