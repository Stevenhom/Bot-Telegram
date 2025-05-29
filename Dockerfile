FROM node:22-slim

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

WORKDIR /app

# Copie package.json et package-lock.json en premier pour profiter du cache Docker
COPY package*.json ./

# Installe les dépendances (dont Puppeteer avec Chromium)
RUN npm install

# Copie le reste du code source
COPY . .

EXPOSE 10000

CMD ["node", "bot.js"]
