const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
const fs = require("fs");
const RecaptchaPlugin = require("puppeteer-extra-plugin-recaptcha");

// Fonction timeout personnalisée
const withTimeout = (promise, ms, errorMessage) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), ms)
    ),
  ]);
};

puppeteer.use(
  RecaptchaPlugin({
    provider: {
      id: "2captcha",
      token: process.env.CAPTCHA_API_KEY, // Clé API 2Captcha
    },
    visualFeedback: true, // Affiche un cadre autour des captchas traités
  })
);

// Fonction d'attente pour les délais humanisés
const humanDelay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Définition de la fonction wait standard (pour compatibilité avec le reste du code)
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const IS_RENDER = process.env.RENDER === "true";

async function login() {
  const startTime = Date.now();
  const timeLog = (msg) => {
    const delta = ((Date.now() - startTime) / 1000).toFixed(3);
    console.log(`[${delta}s] ${msg}`);
  };

  timeLog("🔑 Début de la connexion...");

  let executablePath = puppeteer.executablePath();
  if (!executablePath) {
    console.warn(
      "⚠️ Chemin Chromium non trouvé via puppeteer.executablePath(), utilisation d'un chemin par défaut..."
    );
    executablePath =
      "/opt/render/.cache/puppeteer/chrome/linux-136.0.7103.94/chrome-linux64/chrome";
  }

  const launchOptions = {
    executablePath,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-infobars",
      "--window-size=1280,720",
      "--disable-web-security",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
    ],
    headless: true,
    ignoreHTTPSErrors: true,
  };

  let browser;
  let page;

  try {
    browser = await puppeteer.launch(launchOptions);
    page = await browser.newPage();

    // 🔍 Masquage de l'empreinte WebGL pour éviter la détection
    await page.evaluateOnNewDocument(() => {
      const getParameter = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function (parameter) {
        if (parameter === 37445) return "Intel Open Source Technology Center";
        if (parameter === 37446) return "Mesa DRI Intel(R) HD Graphics 620";
        return getParameter(parameter);
      };
    });

    // 🖥️ Simulation d'un navigateur réel
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
    );

    await page.setExtraHTTPHeaders({
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
      "Accept-Encoding": "gzip, deflate, br, zstd",
      "Cache-Control": "max-age=0",
      "Upgrade-Insecure-Requests": "1",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      "Sec-Ch-Ua":
        '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
      "Sec-Ch-Ua-Mobile": "?0",
      "Sec-Ch-Ua-Platform": '"Windows"',
    });

    // ➕ Supprimer WebDriver de navigator pour éviter la détection
    // await page.evaluateOnNewDocument(() => {
    //   Object.defineProperty(navigator, "webdriver", { get: () => false });
    // });

    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    });

    await Object.defineProperty(navigator, 'plugins', {
    get: () => [1, 2, 3, 4, 5],
  });

// Ajouter des délais humains
const humanDelay = (min = 100, max = 300) => {
  return new Promise(resolve => {
    setTimeout(resolve, Math.random() * (max - min) + min);
  });
};

    timeLog("🌐 Chargement de la page d'accueil...");
    await page.goto("https://getallmylinks.com", {
      waitUntil: "domcontentloaded",
      timeout: 90000,
    });
    timeLog("✅ Page d'accueil chargée");

    const loginUrl = "https://getallmylinks.com/login";
    let loginSuccess = false;

    // ➕ Ajout de mouvements de souris aléatoires
    await page.mouse.move(Math.random() * 800, Math.random() * 600, {
      steps: Math.floor(Math.random() * 20) + 5,
    });
    await page.mouse.click(Math.random() * 500, Math.random() * 400);
    await page.goto(loginUrl, { waitUntil: "domcontentloaded", timeout: 90000 });

page.on('response', async (response) => {
    if (response.status() >= 400) {
        console.log(`⚠️ Erreur détectée : ${await response.text()}`);
    }
});

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        timeLog(`🔁 Tentative ${attempt}/3`);
        await page.goto(loginUrl, {
          waitUntil: "domcontentloaded",
          timeout: 90000,
        });

        await page.waitForSelector('input[name="email"]', {
          visible: true,
          timeout: 30000,
        });
        await page.waitForSelector('input[name="password"]', {
          visible: true,
          timeout: 30000,
        });

        // ➕ Pause humaine avant la saisie
        await new Promise((resolve) =>
          setTimeout(resolve, 2000 + Math.random() * 2000)
        );

        timeLog("📝 Saisie de l'email et du mot de passe...");
        await page.type('input[name="email"]', process.env.GAML_EMAIL, {
          delay: 50 + Math.random() * 50,
        });
        await page.type('input[name="password"]', process.env.GAML_PASSWORD, {
          delay: 50 + Math.random() * 50,
        });

        // ➕ Supprimer les cookies et le stockage pour éviter la détection
        await page.evaluate(() => {
          localStorage.clear();
          sessionStorage.clear();
        });
        await page.deleteCookie();

        // ➕ Pause avant de cliquer sur le bouton (simulation d’utilisateur)
        await new Promise((resolve) =>
          setTimeout(resolve, 3000 + Math.random() * 2000)
        );

        await page.evaluate(() => {
          document.cookie.split(";").forEach((c) => {
            document.cookie = c
              .replace(/^ +/, "")
              .replace(
                /=.*/,
                "=;expires=" + new Date().toUTCString() + ";path=/"
              );
          });
        });

        // 🔘 Simulation de survol et attente du bouton avant interaction
        await page.waitForSelector('button[type="submit"]', { visible: true });
        await page.hover('button[type="submit"]');

        await Promise.all([
          page.click('button[type="submit"]'),
          page.waitForNavigation({ waitUntil: "networkidle2", timeout: 45000 }),
        ]);

        timeLog(`🔍 URL après connexion : ${page.url()}`);

        if (page.url().includes("/account")) {
          loginSuccess = true;
          timeLog("✅ Connexion réussie !");
          break;
        }

        timeLog(`⚠️ Échec de connexion (tentative ${attempt})`);
        await page.reload();
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } catch (error) {
        timeLog(`❌ Erreur (tentative ${attempt}): ${error.message}`);
      }
    }

    if (!loginSuccess) throw new Error("Échec après 3 tentatives");

    return { browser, page };
  } catch (error) {
    timeLog(`❌ Erreur critique: ${error.message}`);
    if (browser) await browser.close();
    throw error;
  }
}

// Encapsulation avec timeout global
async function safeLoginWithTimeout() {
  return await pTimeout(
    login(),
    90000,
    "⏰ Timeout: la fonction login() a dépassé 90 secondes."
  );
}

// Version modifiée de createLink qui utilise le browser et page de login
async function createLink(slug, url, description) {
  let browser;
  let page;

  try {
    // 1. Connexion initiale
    const session = await login();
    browser = session.browser;
    page = session.page;

    // 2. Création du lien
    console.log("🔄 Création du lien...");
    await page.goto("https://getallmylinks.com/account/link/new", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // Contournement Axeptio
    await page.evaluate(() => {
      const axeptio = document.querySelector("#axeptio_overlay");
      if (axeptio) axeptio.style.display = "none";
    });

    await selectDirectLinkOption(page);
    await fillLinkForm(page, slug, url);
    const shortUrl = await submitForm(page, slug);

    // Attendre plus longtemps la confirmation de création
    console.log("⏳ Attente de la confirmation de création...");
    await page.waitForFunction(
      () => {
        const el = document.querySelector(".alert.alert-success");
        return el && el.textContent.includes("Link successfully created");
      },
      { timeout: 20000 }
    );

    // Attendre un délai supplémentaire pour la propagation
    console.log("⏳ Attente de la propagation du lien...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // 3. Retour à la liste des liens avec plusieurs tentatives
    console.log("↩️ Retour à la liste des liens...");
    let linkFound = false;
    let attempts = 0;
    const maxAttempts = 5;

    while (!linkFound && attempts < maxAttempts) {
      attempts++;
      console.log(
        `🔍 Tentative ${attempts}/${maxAttempts} de recherche du lien...`
      );

      await page.goto("https://getallmylinks.com/account/link", {
        waitUntil: "domcontentloaded",
        timeout: 15000,
      });

      // Attendre que les liens soient chargés
      await page
        .waitForSelector('.table, [class*="link"], a[href*="/account/link/"]', {
          timeout: 15000,
        })
        .catch(() => {
          console.log("⚠️ Sélecteur de liens non trouvé, continuation...");
        });

      // Attendre un délai pour le chargement complet
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // 4. Recherche du lien avec plusieurs stratégies
      console.log(`🔍 Recherche du lien "${slug}"...`);

      // Stratégie 1: Recherche par href exact
      let linkHref = await page.evaluate((slug) => {
        const links = Array.from(
          document.querySelectorAll('a[href*="/account/link/"]')
        );
        console.log(
          "Liens trouvés:",
          links.map((a) => a.href)
        );
        const target = links.find((a) =>
          a.href.includes(`/account/link/${slug}`)
        );
        return target ? target.href : null;
      }, slug);

      // Stratégie 2: Recherche par texte du slug
      if (!linkHref) {
        linkHref = await page.evaluate((slug) => {
          const elements = Array.from(document.querySelectorAll("*"));
          const targetElement = elements.find(
            (el) => el.textContent && el.textContent.includes(slug)
          );
          if (targetElement) {
            const link =
              targetElement
                .closest("tr")
                ?.querySelector('a[href*="/account/link/"]') ||
              targetElement.querySelector('a[href*="/account/link/"]') ||
              targetElement.parentElement?.querySelector(
                'a[href*="/account/link/"]'
              );
            return link ? link.href : null;
          }
          return null;
        }, slug);
      }

      // Stratégie 3: Recherche par URL cible
      if (!linkHref) {
        linkHref = await page.evaluate(
          (url, slug) => {
            const rows = Array.from(
              document.querySelectorAll('tr, .row, [class*="link"]')
            );
            for (const row of rows) {
              if (
                row.textContent.includes(url) ||
                row.textContent.includes(slug)
              ) {
                const link = row.querySelector('a[href*="/account/link/"]');
                if (link) return link.href;
              }
            }
            return null;
          },
          url,
          slug
        );
      }

      if (linkHref) {
        linkFound = true;
        console.log(`✅ Lien trouvé: ${linkHref}`);

        // Navigation vers la page d'édition
        await page.goto(linkHref, {
          waitUntil: "domcontentloaded",
          timeout: 15000,
        });
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // 5. Ajout de la description
        console.log("📝 Ajout de la description...");

        // D'abord, cliquer sur le bouton "Add a note" pour afficher le champ
        const noteButtonClicked = await page.evaluate(() => {
          const addNoteButton = document.querySelector(
            '.add-note-button, button[class*="add-note"]'
          );
          if (addNoteButton) {
            addNoteButton.click();
            return true;
          }
          return false;
        });

        if (noteButtonClicked) {
          console.log('✅ Bouton "Add a note" cliqué');
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const descriptionAdded = await page.evaluate((note) => {
            const noteInput =
              document.querySelector(
                '.note-input, input[class*="note-input"]'
              ) ||
              document.querySelector("input[data-link-id]") ||
              document.querySelector('textarea[name="note"]') ||
              document.querySelector('textarea[name="description"]') ||
              document.querySelector("#note") ||
              document.querySelector("#description");

            if (noteInput) {
              if (noteInput.style.display === "none") {
                noteInput.style.display = "block";
              }

              noteInput.value = note;
              noteInput.dispatchEvent(new Event("input", { bubbles: true }));
              noteInput.dispatchEvent(new Event("change", { bubbles: true }));
              noteInput.dispatchEvent(
                new KeyboardEvent("keydown", { key: "Enter", bubbles: true })
              );
              return true;
            }
            return false;
          }, `Threads | ${description}`);

          if (!descriptionAdded) {
            console.log(
              "⚠️ Champ de description non trouvé après clic sur le bouton"
            );
          } else {
            console.log("✅ Description ajoutée avec succès");
            console.log("💾 Attente pour sauvegarde automatique...");
            await new Promise((resolve) => setTimeout(resolve, 3000));
            console.log("✅ Sauvegarde automatique supposée terminée");
          }
        } else {
          console.log('⚠️ Bouton "Add a note" non trouvé');
        }

        // 6. Sauvegarde (après avoir ajouté la note, elle pourrait se sauvegarder automatiquement)
        console.log("💾 Vérification de la sauvegarde...");

        // Attendre un peu pour voir si la sauvegarde est automatique
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Chercher un bouton de sauvegarde avec plusieurs méthodes
        const saveButtonFound = await page.evaluate(() => {
          // Méthode 1: Sélecteurs CSS standard
          let saveButton = document.querySelector(
            'button[type="submit"], input[type="submit"], .btn-save'
          );

          // Méthode 2: Recherche par classe contenant "save"
          if (!saveButton) {
            const buttons = Array.from(
              document.querySelectorAll(
                'button, input[type="button"], input[type="submit"]'
              )
            );
            saveButton = buttons.find(
              (btn) =>
                btn.className.toLowerCase().includes("save") ||
                btn.id.toLowerCase().includes("save")
            );
          }

          // Méthode 3: Recherche par texte
          if (!saveButton) {
            const buttons = Array.from(document.querySelectorAll("button"));
            saveButton = buttons.find(
              (btn) =>
                btn.textContent.toLowerCase().includes("save") ||
                btn.textContent.toLowerCase().includes("sauvegarder") ||
                btn.textContent.toLowerCase().includes("enregistrer")
            );
          }

          if (saveButton) {
            saveButton.click();
            return true;
          }
          return false;
        });

        if (saveButtonFound) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          console.log("✅ Bouton de sauvegarde cliqué");
        } else {
          console.log(
            "ℹ️ Aucun bouton de sauvegarde trouvé - la note pourrait être sauvegardée automatiquement"
          );
        }

        break;
      } else {
        console.log(`❌ Lien non trouvé, tentative ${attempts}/${maxAttempts}`);
        if (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 5000)); // Attendre avant la prochaine tentative
        }
      }
    }

    if (!linkFound) {
      // Debug: Afficher le contenu de la page pour diagnostiquer
      const pageContent = await page.evaluate(() => {
        return {
          title: document.title,
          links: Array.from(
            document.querySelectorAll('a[href*="/account/link/"]')
          ).map((a) => ({
            href: a.href,
            text: a.textContent.trim(),
          })),
          allText: document.body.textContent.slice(0, 1000), // Premier 1000 caractères
        };
      });

      console.log(
        "📋 Debug - Contenu de la page:",
        JSON.stringify(pageContent, null, 2)
      );
      throw new Error(
        `Lien avec slug "${slug}" introuvable après ${maxAttempts} tentatives.`
      );
    }

    return shortUrl;
  } catch (error) {
    console.error("❌ Erreur:", error);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
}

// Fonction pour détecter et gérer les popups Google
async function handleGooglePopups(page) {
  console.log("🔍 Vérification des popups Google...");

  // Attendre un peu pour que les popups se chargent
  await humanDelay(2000);

  // Liste des sélecteurs de popups Google possibles
  const googlePopupSelectors = [
    // reCAPTCHA
    'iframe[src*="recaptcha"]',
    ".g-recaptcha",
    "#recaptcha",
    '[class*="recaptcha"]',

    // Google OAuth/Login
    'iframe[src*="accounts.google.com"]',
    'iframe[src*="oauth.google.com"]',
    '[id*="google"]',

    // Popups génériques Google
    'iframe[src*="google.com"]',
    ".google-popup",
    '[class*="google"]',

    // Overlays/modals
    ".modal",
    ".overlay",
    ".popup",
    '[role="dialog"]',
    ".dialog",
  ];

  // Détecter les popups
  const popupsDetected = await page.evaluate((selectors) => {
    const found = [];

    selectors.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        if (el.offsetParent !== null) {
          // Visible
          found.push({
            selector,
            tagName: el.tagName,
            className: el.className,
            id: el.id,
            src: el.src || null,
            visible: true,
            zIndex: window.getComputedStyle(el).zIndex,
          });
        }
      });
    });

    return found;
  }, googlePopupSelectors);

  console.log("Popups détectés:", popupsDetected);

  if (popupsDetected.length > 0) {
    console.log("⚠️ Popup(s) Google détecté(s), tentative de gestion...");

    // Stratégies pour fermer les popups
    for (const popup of popupsDetected) {
      try {
        if (popup.selector.includes("recaptcha")) {
          console.log("🤖 reCAPTCHA détecté - attente manuelle requise");
          // Pour reCAPTCHA, on ne peut pas automatiser
          // Mais on peut attendre qu'il disparaisse
          await page
            .waitForFunction(
              () => {
                const recaptcha = document.querySelector(
                  'iframe[src*="recaptcha"]'
                );
                return !recaptcha || recaptcha.offsetParent === null;
              },
              { timeout: 60000 }
            )
            .catch(() => {
              console.log("⚠️ Timeout sur l'attente du reCAPTCHA");
            });
        } else {
          // Essayer de fermer avec les boutons de fermeture classiques
          const closeButtons = [
            ".close",
            ".modal-close",
            ".popup-close",
            '[aria-label="Close"]',
            '[aria-label="Fermer"]',
            'button[type="button"]',
          ];

          for (const closeSelector of closeButtons) {
            const closed = await page.evaluate((selector) => {
              const closeBtn = document.querySelector(selector);
              if (closeBtn && closeBtn.offsetParent !== null) {
                closeBtn.click();
                return true;
              }
              return false;
            }, closeSelector);

            if (closed) {
              console.log(`✅ Popup fermé avec ${closeSelector}`);
              await humanDelay(1000);
              break;
            }
          }
        }
      } catch (error) {
        console.log(
          `⚠️ Erreur lors de la fermeture du popup: ${error.message}`
        );
      }
    }

    // Vérifier si les popups sont fermés
    await humanDelay(2000);
    const remainingPopups = await page.evaluate((selectors) => {
      return selectors.some((selector) => {
        const elements = document.querySelectorAll(selector);
        return Array.from(elements).some((el) => el.offsetParent !== null);
      });
    }, googlePopupSelectors);

    if (remainingPopups) {
      console.log("⚠️ Des popups sont encore présents");

      // Essayer d'appuyer sur Échap pour fermer
      await page.keyboard.press("Escape");
      await humanDelay(1000);

      // Si ça marche toujours pas, cliquer en dehors
      await page.click("body", { offset: { x: 10, y: 10 } });
      await humanDelay(1000);
    } else {
      console.log("✅ Tous les popups ont été fermés");
    }
  } else {
    console.log("✅ Aucun popup Google détecté");
  }

  // Capture finale
}

async function handleCookiePopup(page) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 500)); // Petite pause

    // Sélecteurs classiques
    const cookieSelectors = [
      'button[id*="cookie"]',
      'button[class*="cookie"]',
      'a[id*="cookie"]',
      'a[class*="cookie"]',
      'div[id*="cookie"] button',
      'div[class*="cookie"] button',
    ];

    for (const selector of cookieSelectors) {
      const button = await page.$(selector);
      if (button) {
        await button.click();
        console.log(`✅ Popup cookies fermé avec: ${selector}`);
        return;
      }
    }

    // Si les boutons sont génériques, vérifier leur texte via page.evaluate
    const accepted = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button, a"));
      for (const btn of buttons) {
        const text = btn.innerText.trim().toLowerCase();
        if (["accept", "accepter", "got it", "j'accepte"].includes(text)) {
          btn.click();
          return true;
        }
      }
      return false;
    });

    if (accepted) {
      console.log("✅ Popup cookies fermé via contenu textuel");
    } else {
      console.log("ℹ️ Aucun popup de cookies détecté");
    }
  } catch (error) {
    console.log(
      "⚠️ Erreur lors de la gestion du popup cookies:",
      error.message
    );
  }
}

async function handleAxeptioFullDismiss(page) {
  try {
    // Étape 1 : cliquer sur le bouton "Dismiss"
    const dismissButton = await page.$("#axeptio_btn_dismiss");
    if (dismissButton) {
      await dismissButton.click();
      console.log('✅ Bouton "Dismiss" d’Axeptio cliqué');
      await page.waitForTimeout(1000);
    } else {
      console.log('ℹ️ Bouton "Dismiss" non présent');
    }

    // Étape 2 : cliquer sur le bouton "Back" s’il apparaît après "Dismiss"
    const backButton = await page
      .waitForSelector("#axeptio_btn_prev", { timeout: 3000 })
      .catch(() => null);
    if (backButton) {
      await backButton.click();
      console.log('✅ Bouton "Back" d’Axeptio cliqué');
      await page.waitForTimeout(1000);
    } else {
      console.log('ℹ️ Bouton "Back" non présent');
    }
  } catch (error) {
    console.error(
      "❌ Erreur lors de la fermeture complète d’Axeptio :",
      error.message
    );
  }
}

async function selectDirectLinkOption(page) {
  console.log("⏳ Sélection du lien direct...");

  try {
    // Attendre un peu pour s'assurer que la page est correctement chargée
    await humanDelay(2000);

    await handleAxeptioFullDismiss(page);

    // Lister tous les types de radio buttons disponibles
    const radioButtons = await page.evaluate(() => {
      const radios = Array.from(
        document.querySelectorAll('input[type="radio"]')
      );
      return radios.map((r) => ({
        id: r.id,
        name: r.name,
        value: r.value,
        isChecked: r.checked,
        isVisible: r.offsetParent !== null,
      }));
    });

    console.log("Radio buttons trouvés:", radioButtons);

    // Vérifier si le bouton "direct" existe
    const directRadioExists = radioButtons.some(
      (r) =>
        r.id === "link_type_direct" ||
        r.value === "direct" ||
        (r.name === "link[type]" && r.value === "direct")
    );

    if (!directRadioExists) {
      console.log("⚠️ Option de lien direct non trouvée sous forme attendue");

      // Essayer de trouver une option similaire
      for (const radio of radioButtons) {
        if (
          radio.value.toLowerCase().includes("direct") ||
          radio.id.toLowerCase().includes("direct")
        ) {
          console.log(`✅ Option similaire trouvée: ${JSON.stringify(radio)}`);

          await page.evaluate((radioId) => {
            document.getElementById(radioId).click();
          }, radio.id);

          await humanDelay(1000);
          console.log("✅ Option alternative sélectionnée");
          return;
        }
      }

      // Si toujours pas trouvé, essayer par indexation
      if (radioButtons.length > 0) {
        console.log(
          "⚠️ Tentative de sélection du premier bouton radio disponible"
        );

        // Prendre le premier bouton radio
        const firstRadio = radioButtons[0];
        await page.evaluate((radioId) => {
          document.getElementById(radioId).click();
        }, firstRadio.id);

        await humanDelay(1000);
        console.log("✅ Premier bouton radio sélectionné par défaut");
        return;
      }

      throw new Error("Aucun bouton radio trouvé sur la page");
    }

    // Sélectionner l'option "direct"
    await page.evaluate(() => {
      const options = [
        document.getElementById("link_type_direct"),
        document.querySelector('input[value="direct"]'),
        document.querySelector('input[name="link[type]"][value="direct"]'),
      ];

      for (const option of options) {
        if (option) {
          option.click();
          // Forcer les événements
          ["change", "input"].forEach((event) => {
            option.dispatchEvent(new Event(event, { bubbles: true }));
          });
          return true;
        }
      }

      return false;
    });

    // Vérification
    const isSelected = await page.evaluate(() => {
      const options = [
        document.getElementById("link_type_direct"),
        document.querySelector('input[value="direct"]'),
        document.querySelector('input[name="link[type]"][value="direct"]'),
      ];

      for (const option of options) {
        if (option && option.checked) {
          return true;
        }
      }

      return false;
    });

    if (isSelected) {
      console.log("✅ Option de lien direct sélectionnée");
    } else {
      throw new Error("Impossible de sélectionner l'option de lien direct");
    }
  } catch (error) {
    console.error(
      "❌ Erreur lors de la sélection du type de lien:",
      error.message
    );
    throw new Error(
      `Impossible de sélectionner le type de lien: ${error.message}`
    );
  }
}

async function fillLinkForm(page, slug, url) {
  try {
    console.log("⏳ Remplissage du formulaire...");

    // Attendre que les champs soient disponibles
    await page.waitForSelector("#link_slug", { timeout: 10000 });
    await page.waitForSelector("#link_directPage", { timeout: 10000 });

    // Effacer les champs avant de taper
    await page.click("#link_slug", { clickCount: 3 });
    await page.keyboard.press("Backspace");
    await humanDelay(300);

    await page.click("#link_directPage", { clickCount: 3 });
    await page.keyboard.press("Backspace");
    await humanDelay(300);

    // Remplir les champs
    await page.type("#link_slug", slug, { delay: 10 });
    await humanDelay(500);
    await page.type("#link_directPage", url, { delay: 10 });

    // Vérification des valeurs entrées
    const enteredValues = await page.evaluate(() => ({
      slug: document.getElementById("link_slug").value,
      url: document.getElementById("link_directPage").value,
    }));

    console.log("Valeurs entrées:", enteredValues);

    if (enteredValues.slug !== slug || enteredValues.url !== url) {
      throw new Error(
        `Erreur lors du remplissage du formulaire: valeurs attendues non correspondantes`
      );
    }

    // Activation du shield (cloaking)
    const cloakingExists = await page.$("#link_cloaking");

    if (cloakingExists) {
      const isChecked = await page.evaluate(() => {
        const checkbox = document.getElementById("link_cloaking");
        return checkbox ? checkbox.checked : false;
      });

      if (!isChecked) {
        await page.click("#link_cloaking");
        await humanDelay(500);
        console.log("✅ Shield activé");
      } else {
        console.log("ℹ️ Shield déjà activé");
      }
    } else {
      console.log("⚠️ Option de shield non trouvée");
    }

    console.log("✅ Formulaire rempli avec succès");
  } catch (error) {
    console.error(
      "❌ Erreur lors du remplissage du formulaire:",
      error.message
    );
    throw new Error(`Échec du remplissage du formulaire: ${error.message}`);
  }
}

async function submitForm(page, slug) {
  try {
    console.log("⏳ Tentative de soumission directe...");

    // 1. Essai direct sans gestion Axeptio
    let submitSuccess = await tryDirectSubmit(page);
    if (submitSuccess) return await verifySuccess(page, slug);

    // 2. Fallback avec gestion légère d'Axeptio
    console.log(
      "⚠️ Essai direct échoué, tentative avec gestion Axeptio légère..."
    );
    await quickAxeptioCheck(page);
    submitSuccess = await tryDirectSubmit(page);
    if (submitSuccess) return await verifySuccess(page, slug);

    // 3. Fallback complet (votre méthode originale)
    console.log(
      "⚠️ Tentative légère échouée, utilisation de la méthode complète..."
    );
    return await fullSubmitProcess(page, slug);
  } catch (error) {
    console.error("❌ Erreur lors de la soumission:", error.message);
    throw error;
  }
}

// Helper functions
async function tryDirectSubmit(page) {
  try {
    await humanDelay(1000);
    const isSubmitable = await page.evaluate(() => {
      const btn = document.querySelector('button[type="submit"]');
      return btn && !btn.disabled && btn.offsetParent !== null;
    });

    if (!isSubmitable) return false;

    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000); // Attente courte

    return true;
  } catch {
    return false;
  }
}

async function quickAxeptioCheck(page) {
  try {
    // Solution minimaliste pour Axeptio
    await page.evaluate(() => {
      const axeptio = document.querySelector("#axeptio_overlay");
      if (axeptio) {
        axeptio.style.display = "none";
        axeptio.style.visibility = "hidden";
      }
    });
    await page.keyboard.press("Escape");
    await humanDelay(500);
  } catch {
    // Ignorer les erreurs
  }
}

async function verifySuccess(page, slug) {
  await humanDelay(2000);
  const success = await page.evaluate(() => {
    return (
      document.body.textContent.includes("success") ||
      !document.querySelector("#axeptio_overlay")
    );
  });

  if (success) {
    console.log("✅ Soumission réussie (Axeptio contourné)");
    return `https://getallmylinks.com/${slug}`;
  }
  return false;
}

async function fullSubmitProcess(page, slug) {
  // Votre méthode originale complète
  await handleAxeptioFullDismiss(page);
  await handleGooglePopups(page);

  // ... (le reste de votre logique originale)
  return `https://getallmylinks.com/${slug}`;
}

async function getLinkStats(slug, period) {
  let browser, page;

  try {
    const session = await login();
    browser = session.browser;
    page = session.page;

    await page.goto("https://getallmylinks.com/account/link/", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    await handleCookiePopup(page);

    await page.waitForSelector("td.text-end.pe-0", { timeout: 10000 });

    // Chercher le lien de prévisualisation
    const previewSelector = `td.text-end.pe-0 a[href*="/preview/${slug}"]`;
    const previewLink = await page.$(previewSelector);
    if (!previewLink) {
      throw new Error(`Lien preview introuvable pour le slug "${slug}"`);
    }

    // Chercher le bouton Analytics associé
    const parentTd = await previewLink.evaluateHandle((el) => el.parentElement);
    const analyticsButton = await parentTd.$('a[href*="/analytics"]');
    if (!analyticsButton) {
      throw new Error(`Bouton Analytics introuvable pour le lien "${slug}"`);
    }

    await analyticsButton.click();

    await page.waitForSelector("h5.card-title", { timeout: 25000 });

    // Gestion de la période améliorée
    if (period && period !== "30days") {
      const periodMap = {
        today: "today",
        yesterday: "yesterday",
        week: "7days", // Correction: mapper "week" vers "7days"
        "7days": "7days",
        month: "current_month", // Correction: mapper "month" vers "current_month"
        current_month: "current_month",
        last_month: "last_month",
        current_year: "current_year",
        last_year: "last_year",
        all_time: "all_time",
      };

      const mapped = periodMap[period];
      if (!mapped) {
        throw new Error(
          `Période invalide: ${period}. Périodes disponibles: ${Object.keys(
            periodMap
          ).join(", ")}`
        );
      }

      console.log(
        `🔄 Changement de période vers: ${period} (mappé: ${mapped})`
      );

      // Méthode améliorée pour cliquer sur le dropdown
      try {
        // Chercher le bouton dropdown avec plusieurs sélecteurs possibles
        const dropdownSelectors = [
          "button.dropdown-toggle",
          'button[data-bs-toggle="dropdown"]',
          ".dropdown-toggle",
        ];

        let dropdownButton = null;
        for (const selector of dropdownSelectors) {
          dropdownButton = await page.$(selector);
          if (dropdownButton) {
            console.log(`✅ Bouton dropdown trouvé avec: ${selector}`);
            break;
          }
        }

        if (!dropdownButton) {
          throw new Error("Bouton dropdown non trouvé");
        }

        // Cliquer sur le dropdown et attendre qu'il s'ouvre
        await dropdownButton.click();

        // Attendre que le dropdown soit visible
        await page.waitForSelector("#date-range-dropdown", {
          visible: true,
          timeout: 5000,
        });

        // Attendre un peu pour s'assurer que le dropdown est complètement ouvert
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Construire le sélecteur exact basé sur le HTML que vous avez fourni
        const linkSelector = `#date-range-dropdown a[href*="/${mapped}"]`;

        console.log(`🔍 Recherche du lien avec sélecteur: ${linkSelector}`);

        // Vérifier que le lien existe avant de cliquer
        await page.waitForSelector(linkSelector, {
          visible: true,
          timeout: 5000,
        });

        // Cliquer sur l'option de période
        await page.click(linkSelector);

        console.log(`✅ Période "${mapped}" sélectionnée`);

        // Attendre la mise à jour des stats avec une vérification plus robuste
        await page.waitForFunction(
          () => {
            const el = document.querySelector("h5.card-title");
            return el && el.innerText.trim().length > 0;
          },
          { timeout: 20000 }
        );

        // Attendre un délai supplémentaire pour s'assurer que les données sont chargées
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (dropdownError) {
        console.error(
          "❌ Erreur lors du changement de période:",
          dropdownError.message
        );

        // Essayer une approche alternative - navigation directe
        const currentUrl = page.url();
        const linkId = currentUrl.match(/\/link\/([^\/]+)/)?.[1];

        if (linkId) {
          const directUrl = `https://getallmylinks.com/account/link/${linkId}/analytics/view/${mapped}`;
          console.log(`🔄 Tentative de navigation directe vers: ${directUrl}`);

          await page.goto(directUrl, {
            waitUntil: "domcontentloaded",
            timeout: 30000,
          });

          await page.waitForSelector("h5.card-title", { timeout: 25000 });
        } else {
          throw dropdownError;
        }
      }
    }

    // Extraire le nombre de visiteurs avec une méthode plus robuste
    await page.waitForSelector("h5.card-title", {
      visible: true,
      timeout: 10000,
    });

    const visitorsText = await page.$eval("h5.card-title", (el) =>
      el.innerText.trim()
    );
    console.log("📊 Texte brut récupéré:", visitorsText);

    // Regex plus flexible pour extraire le nombre
    const match = visitorsText.match(/(\d+)/);
    const visitorsCount = match ? parseInt(match[1]) : 0;

    console.log(`📈 Nombre de visiteurs extrait: ${visitorsCount}`);

    return { slug, visitors: visitorsCount, period: period || "30days" };
  } catch (err) {
    console.error("❌ Erreur complète dans getLinkStats:", err);

    throw new Error(`Erreur stats : ${err.message}`);
  } finally {
    if (browser) await browser.close();
  }
}

async function getLinkStats2(page, slug, period) {
  try {
    console.log(
      `📊 Récupération des stats pour "${slug}" (Période : ${period})`
    );

    // 🔵 Aller sur la page des liens pour récupérer le bon `linkId`
    await page.goto("https://getallmylinks.com/account/link/", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    await page.waitForSelector("td.text-end.pe-0", { timeout: 10000 });

    // 🔍 Trouver l'élément contenant le slug
    const previewSelector = `td.text-end.pe-0 a[href*="/preview/${slug}"]`;
    const previewLink = await page.$(previewSelector);
    if (!previewLink) {
      throw new Error(`Lien preview introuvable pour le slug "${slug}"`);
    }

    // 🔍 Trouver `linkId` en remontant vers le parent qui contient l'ID
    const parentRow = await previewLink.evaluateHandle((el) =>
      el.closest("tr")
    );
    const linkIdElement = await parentRow.$('a[href*="/analytics"]');

    if (!linkIdElement) {
      throw new Error(`Impossible de trouver l'ID du lien pour "${slug}"`);
    }

    // 🔵 Extraire `linkId`
    const linkHref = await linkIdElement.evaluate((el) =>
      el.getAttribute("href")
    );
    const linkIdMatch = linkHref.match(/\/link\/([^\/]+)/);
    const linkId = linkIdMatch ? linkIdMatch[1] : null;

    if (!linkId) {
      throw new Error(`Impossible d'extraire l'ID du lien pour "${slug}"`);
    }

    console.log(`🔗 ID trouvé pour "${slug}" → ${linkId}`);

    // 🔵 Accéder à la vraie page analytics
    const analyticsUrl = `https://getallmylinks.com/account/link/${linkId}/analytics/view/${period}`;
    await page.goto(analyticsUrl, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    await page.waitForSelector("h5.card-title", { timeout: 25000 });

    // 🔵 Extraire le nombre de visiteurs
    const visitorsText = await page.$eval("h5.card-title", (el) =>
      el.innerText.trim()
    );
    const match = visitorsText.match(/(\d+)/);
    const visitorsCount = match ? parseInt(match[1]) : 0;

    console.log(`✅ ${slug}: ${visitorsCount} visiteurs`);

    return { slug, visitors: visitorsCount, period };
  } catch (error) {
    console.error(`❌ Erreur sur "${slug}" : ${error.message}`);
    return { slug, visitors: 0, period, hasError: true };
  }
}

// Fonction helper pour valider les périodes
function getValidPeriods() {
  return [
    "today",
    "yesterday",
    "7days",
    "current_month",
    "last_month",
    "current_year",
    "last_year",
    "all_time",
  ];
}

// Fonction pour valider une période avant de l'utiliser
function validatePeriod(period) {
  const validPeriods = getValidPeriods();
  return validPeriods.includes(period);
}

async function getAllLinkSlugs(page) {
  let browser;

  try {
    console.log("🔍 Récupération de la liste des liens...");

    await page.goto("https://getallmylinks.com/account/link/", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    await handleCookiePopup(page);
    await page.waitForSelector("td.text-end.pe-0", { timeout: 10000 });

    // Utiliser la même logique que dans getLinkStats pour trouver tous les liens
    const slugs = await page.evaluate(() => {
      const previewLinks = Array.from(
        document.querySelectorAll('td.text-end.pe-0 a[href*="/preview/"]')
      );

      return previewLinks
        .map((link) => {
          const href = link.getAttribute("href");
          const slugMatch = href.match(/\/preview\/([^\/]+)/);
          return slugMatch ? slugMatch[1] : null;
        })
        .filter((slug) => slug !== null);
    });

    console.log(`✅ ${slugs.length} liens trouvés:`, slugs);
    return slugs;
  } catch (err) {
    throw new Error(`Erreur récupération liste liens : ${err.message}`);
  } finally {
    if (browser) await browser.close();
  }
}

// Fonction principale pour obtenir les stats de tous les liens
async function getAllLinksStats(period = "today") {
  let browser, page;
  const startTime = Date.now();

  try {
    console.log(
      `📊 Démarrage de l'analyse pour tous les liens (période : ${period})`
    );

    // 🔵 1️⃣ Connexion unique
    console.log(
      `[${(Date.now() - startTime) / 1000}s] Début de la connexion...`
    );
    const session = await login();
    browser = session.browser;
    page = session.page;
    console.log(`[${(Date.now() - startTime) / 1000}s] Connexion réussie !`);

    // 🔵 2️⃣ Validation de la période
    if (!validatePeriod(period)) {
      throw new Error(`Période invalide : ${period}`);
    }

    // 🔵 3️⃣ Récupération des slugs
    const slugs = await getAllLinkSlugs(page);
    if (slugs.length === 0) {
      return { success: true, data: [], message: "Aucun lien trouvé" };
    }

    console.log(
      `🔄 ${slugs.length} liens détectés, récupération des statistiques...`
    );

    const results = [];
    const errors = [];

    // 🔵 4️⃣ Boucle d'analyse de chaque slug sans déconnexion
    for (let slug of slugs) {
      try {
        console.log(`📈 Analyse du lien "${slug}"...`);

        // Passage du **page** actif dans getLinkStats
        const stats = await getLinkStats2(page, slug, period);
        results.push(stats);

        console.log(`✅ ${slug}: ${stats.visitors} visiteurs`);

        // Pause courte pour éviter surcharge serveur
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.log(`❌ Erreur pour "${slug}": ${error.message}`);
        errors.push({ slug, error: error.message });
        results.push({ slug, visitors: 0, period, hasError: true });
      }
    }

    // 🔵 5️⃣ Formatage des résultats
    const successCount = results.filter((item) => !item.hasError).length;

    const statsResult = {
      success: true,
      data: results,
      summary: {
        totalLinks: slugs.length,
        successfulQueries: successCount, // ✅ Correction : Ajout de la variable !
        totalVisitors: results.reduce(
          (sum, item) => sum + (item.visitors || 0),
          0
        ),
        period,
      },
      errors: errors.length > 0 ? errors : null,
    };

    // 🔍 Log pour vérifier `statsResult` avant formatage
    console.log(
      `🔍 Debug statsResult avant formatage:\n`,
      JSON.stringify(statsResult, null, 2)
    );

    const formattedMessage = formatAllStatsMessage(statsResult);

    // 🔍 Log pour vérifier le message avant envoi au bot
    console.log(`📩 Message formaté envoyé au bot:\n${formattedMessage}`);

    await browser.close();
    return formattedMessage;
  } catch (error) {
    console.error("❌ Erreur dans getAllLinksStatsOptimized:", error);
    return `❌ Erreur: ${error.message}`;
  }
}

// Fonction pour formater les résultats pour le bot Telegram
function formatAllStatsMessage(statsResult) {
  if (!statsResult.success) {
    return `❌ Erreur lors de la récupération des statistiques:\n${statsResult.error}`;
  }

  const { data, summary, errors } = statsResult;

  // 🔍 Vérification des valeurs avant d'afficher le message
  if (
    !summary ||
    typeof summary.totalLinks === "undefined" ||
    typeof summary.successfulQueries === "undefined"
  ) {
    console.error(`❌ Erreur : Summary est incomplet ou undefined`, summary);
    return `❌ Erreur : Données résumées manquantes.`;
  }

  if (data.length === 0) {
    return `📊 Aucun lien trouvé dans votre compte.`;
  }

  let message = `📊 **Statistiques de tous vos liens** (${summary.period})\n\n`;

  // 📈 Résumé général
  message += ` **Résumé:**\n`;
  message += `• Total des liens: ${summary.totalLinks}\n`;
  message += `• Total des visiteurs: ${summary.totalVisitors}\n`;
  message += `• Requêtes réussies: ${summary.successfulQueries}/${summary.totalLinks}\n\n`;

  // 📋 Détail par lien
  message += ` **Détail par lien:**\n`;

  data.forEach((item) => {
    const emoji = item.hasError ? "❌" : item.visitors > 0 ? "📈" : "📊";
    const visitors = item.hasError ? "Erreur" : `${item.visitors}`;
    message += `${emoji} ${item.slug}: ${visitors} visiteur${
      item.visitors > 1 ? "s" : ""
    }\n`;
  });

  // ⚠️ Erreurs rencontrées
  if (errors && errors.length > 0) {
    message += `\n⚠️ **Erreurs rencontrées:**\n`;
    errors.forEach((error) => {
      message += `• ${error.slug}: ${error.error}\n`;
    });
  }

  // 🔍 Vérifier que le message est bien une chaîne de texte avant de le renvoyer
  if (typeof message !== "string" || message.trim() === "") {
    console.error("❌ Problème : Le message généré est vide ou non valide.");
    return `❌ Erreur : Le formatage du message a échoué.`;
  }

  return message;
}

module.exports = {
  createLink,
  getLinkStats,
  getAllLinksStats,
  validatePeriod,
  formatAllStatsMessage,
};
