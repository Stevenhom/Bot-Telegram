/** @type {import("puppeteer").Configuration} */
module.exports = {
  chrome: {
    skipDownload: false,
  },
  cacheDirectory: './.cache/puppeteer' // ou '/opt/render/.cache/puppeteer' si tu veux vraiment le forcer
};
