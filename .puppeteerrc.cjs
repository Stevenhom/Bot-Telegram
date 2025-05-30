/** @type {import("puppeteer").PuppeteerLaunchOptions} */
module.exports = {
  // Pour éviter le téléchargement automatique de Chromium, on peut forcer skipDownload
  skipDownload: false, // false = Chromium sera téléchargé automatiquement

  // Pour la gestion du cache (le dossier où Puppeteer stocke Chromium téléchargé)
  cacheDirectory: './.cache/puppeteer', // ou '/opt/render/.cache/puppeteer' selon ton environnement
};
