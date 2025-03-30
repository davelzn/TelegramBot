const fs = require('fs')
const TelegramBot = require('node-telegram-bot-api');
const conf = JSON.parse(fs.readFileSync('conf.json'))
const token = conf.key;
const apiKey = conf.apiKey;
const bot = new TelegramBot(token, {polling: true})

bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    if (text === '/start'){
        bot.sendMessage(chatId, "Scegli un'opzione:", {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "🎤 Artista", callback_data: "artista" }],
                    [{ text: "🎵 Canzone", callback_data: "canzone" }],
                    [{ text: "📀 Album", callback_data: "album" }]
                ]
            }
        });
    }
})
bot.on("callback_query", (query) => {
    const chatId = query.message.chat.id;
    const scelta = query.data; // "artista", "canzone" o "album"
    bot.sendMessage(chatId, `Inserisci il nome della/dell' ${scelta}:  `);
    if (scelta == "artista"){
        bot.on("message", (msg) => {
            const artist = msg.text;
            const url = `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(artist)}&api_key=${apiKey}&format=json`;
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    if (!data.artist) {
                        bot.sendMessage(chatId, "❌ Artista non trovato!");
                        return;
                    }

                    const artistInfo = data.artist;
                    const genres = artistInfo.tags.tag.map(tag => tag.name).join(", ");
                    const imageUrl = artistInfo.image[artistInfo.image.length - 1]["#text"];

                    bot.sendMessage(chatId, `🎤 <b>Nome:</b> ${artistInfo.name}\n👥 <b>Ascoltatori:</b> ${artistInfo.stats.listeners}\n🎵 <b>Generi:</b> ${genres}\n📖 <b>Biografia:</b> ${artistInfo.bio.summary}\n🔗 <a href="${artistInfo.url}">Read more on Last.fm</a>`, { parse_mode: "HTML" });

                    if (imageUrl) {
                        bot.sendPhoto(chatId, imageUrl);
                    }
                })
                .catch(error => {
                    console.error("Errore nel recupero dei dati:", error);
                    bot.sendMessage(chatId, "⚠️ Errore nel recupero dei dati!");
                });
        });
    } else if(scelta == "canzone"){
        
    }
    
});