require('dotenv').config();
const { Telegraf } = require('telegraf');
const { createLink, getLinkStats, getAllLinksStats, validatePeriod } = require('./gaml');

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

const requiredVars = ['TELEGRAM_TOKEN', 'GAML_EMAIL', 'GAML_PASSWORD'];
const validPeriods = [
  'today', 'yesterday', '7days', 'current_month', 
  'last_month', 'current_year', 'last_year', 'all_time'
];

requiredVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`❌ Variable manquante dans .env : ${varName}`);
    process.exit(1);
  }
});
console.log('🔐 Configuration .env validée !');

const userState = {};

bot.start((ctx) => {
  ctx.reply(`👋 Salut ${ctx.from.first_name}, bienvenue sur Sirenza Links Manager !
Voici les commandes disponibles :
/createlink – Créer un nouveau lien
/clics – Voir les clics d'un lien
/allclics – Voir les stats de tous tes liens`);
});

bot.command('createlink', async (ctx) => {
  const userId = ctx.from.id;
  userState[userId] = { step: 'awaiting_slug' };
  await ctx.reply('Comment souhaitez-vous nommer le lien ? (ex: jessyrv)');
});

bot.command('clics', async (ctx) => {
  const userId = ctx.from.id;
  userState[userId] = { step: 'awaiting_clics_slug' };
  await ctx.reply('Quel lien voulez-vous analyser ? (ex: jessyrv)');
});

bot.command('allclics', async (ctx) => {
  const userId = ctx.from.id;
  userState[userId] = { step: 'awaiting_allclics_period' };
  await ctx.reply(`📊 Sur quelle période veux-tu les stats ? Choisis parmi :\n• ${validPeriods.join('\n• ')}`);
});

bot.on('text', async (ctx) => {
  const messageText = ctx.message.text.trim();

  if (messageText.startsWith('/')) return;

  const userId = ctx.from.id;
  const state = userState[userId];

  if (!state) {
    return ctx.reply("Commande inconnue ou aucune action en cours. Tape /start pour voir les commandes.");
  }

  if (state.step === 'awaiting_slug') {
    state.slug = messageText;
    state.step = 'awaiting_url';
    await ctx.reply('Quelle URL doit rediriger ce lien ? (ex: https://www.instagram.com/sirenza.agency_)');
  } else if (state.step === 'awaiting_url') {
    state.url = messageText;
    state.step = 'awaiting_description';
    await ctx.reply('Ajoutez une description pour ce lien:');
  } else if (state.step === 'awaiting_description') {
    state.description = messageText;
  
    try {
      await ctx.reply('🔄 Création du lien en cours, merci de patienter...');
      
      // Création du lien + description dans la même session
      const shortUrl = await createLink(state.slug, state.url, state.description);
  
      await ctx.reply(`✅ Lien créé avec succès : ${shortUrl}\n📝 Description ajoutée : "${state.description}"`);
    } catch (err) {
      await ctx.reply(`❌ Erreur lors de la création ou de l’ajout de la description : ${err.message}`);
    }
  
    // Réinitialisation de l'état
    delete userState[userId];
  } else if (state.step === 'awaiting_clics_slug') {
    state.slug = messageText;
    state.step = 'awaiting_period';
    await ctx.reply(`Sur quelle période veux-tu les stats ? Choisis parmi :\n• ${validPeriods.join('\n• ')}`);
  } else if (state.step === 'awaiting_period') {
    try {
      await ctx.reply("⏳ Veuillez patienter, récupération des clics...");
      const stats = await getLinkStats(state.slug, messageText.toLowerCase());
      await ctx.reply(`📊 Clics pour ${state.slug} (${messageText}) : ${stats.visitors}`);
    } catch (err) {
      await ctx.reply(`❌ Erreur : ${err.message}`);
    }
    delete userState[userId];
  } else if (state.step === 'awaiting_allclics_period') {
    if (!validatePeriod(messageText)) {
        return ctx.reply(`❌ Période invalide. Choisis parmi :\n• ${validPeriods.join('\n• ')}`);
    }

    try {
        await ctx.reply("⏳ Veuillez patienter, récupération des statistiques en cours...");
        // ✅ Correction : getAllLinksStats retourne déjà le message formaté
        const formattedMessage = await getAllLinksStats(messageText);
        if (!formattedMessage || formattedMessage.trim() === '') {
            await ctx.reply("❌ Erreur : Le message formaté est vide.");
        } else {
            await ctx.reply(formattedMessage);
        }

    } catch (err) {
        await ctx.reply(`❌ Erreur lors de la récupération des stats : ${err.message}`);
    }

    delete userState[userId];
  }
});


const express = require('express');
const app = express();
// Render fournit le port via process.env.PORT
const port = process.env.PORT || 3000; 

app.get('/', (req, res) => {
  // Un simple message pour indiquer que le service est vivant
  res.send('Bot is running and alive!');
});

app.listen(port, () => {
  console.log(`Web server listening on port ${port}`);
});

// Optionnel : un endpoint pour la vérification de l'état du bot si besoin
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});


bot.launch();
console.log('🤖 Bot Sirenza démarré !');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));