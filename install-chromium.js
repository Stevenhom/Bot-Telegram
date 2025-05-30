const puppeteer = require('puppeteer');
(async () => {
  console.log("📥 Téléchargement de Chromium pour Render...");
  const browserFetcher = puppeteer.createBrowserFetcher({ product: 'chrome' });
  const revisionInfo = await browserFetcher.download(puppeteer._preferredRevision);
  console.log("✅ Chromium téléchargé :", revisionInfo.executablePath);
})();
