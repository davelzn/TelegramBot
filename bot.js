const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');
const conf = JSON.parse(fs.readFileSync('conf.json'));
const token = conf.key;
const apiKey = conf.apiKey;
const bot = new TelegramBot(token, { polling: true });


bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        bot.sendMessage(chatId, "🎵 *Benvenuto!* Scrivi il nome di un album e ti darò tutte le informazioni (se vuoi essere piu preciso inserisci l'artista)!", { parse_mode: "Markdown" });
        return;
    }
    if (text === '/help') {
        bot.sendMessage(chatId,
            `🎵 *Benvenuto nello SpinIt Bot di ricerca album!* 🎵\n\n` +
            `📌 *Come funziona?*\n` +
            `- Scrivi il nome di un album e ti darò tutte le informazioni su di esso.\n` +
            `- Riceverai anche info sull'artista dell'album.\n` +
            `- Non serve nessun comando speciale, basta scrivere il titolo! 🎶\n\n` +
            `📢 *Comandi disponibili:*\n` +
            `- \`/help\` ➝ Mostra questo messaggio di aiuto.\n` +
            `- \`/start\` ➝ Introduzione rapida al bot.\n` +
            `🚀 *Prova subito!* Scrivi il nome di un album e scopri tutti i dettagli!`,
            { parse_mode: "Markdown" }
        );
        return;
    }



    const searchUrl = `http://ws.audioscrobbler.com/2.0/?method=album.search&api_key=${apiKey}&album=${encodeURIComponent(text)}&format=json`;     //ricerca dell'album
    console.log(searchUrl)
    //Faccio prima la ricerca generale perche per ottenere info sull'album devo mettere anche l'artista nell' url
    fetch(searchUrl)
        .then(r => r.json())
        .then(data => {
            //console.log(data)
            if (data.results && data.results.albummatches && data.results.albummatches.album.length > 0) {
                const album = data.results.albummatches.album[0];
                const artista = album.artist || "Sconosciuto";
                const titoloAlbum = album.name || text;
                const infoUrl = `http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${apiKey}&artist=${encodeURIComponent(artista)}&album=${encodeURIComponent(titoloAlbum)}&format=json`; //informazioni specifiche dell'album
                console.log(infoUrl)
                return fetch(infoUrl)
                .then(r => r.json())
                .then(albumData => ({ 
                    albumData, artista 
                }));
            } else {
                bot.sendMessage(chatId, "❌ Album non trovato. Prova con un altro nome.");
                return null;
            }
        })
        .then(({ albumData, artista }) => {
            //console.log(albumData);
            if (!albumData || !albumData.album) return;
            const ascoltatori = albumData.album.listeners || "N/A";
            const linkStreaming = albumData.album.url || "N/A";
            let data,descrizione;
            if (albumData.album.wiki){
                data = albumData.album.wiki.published || "N/A"
                descrizione = albumData.album.wiki.summary.split("<a")[0] || "N/A" //Alla fine della descrizione c'é un link di rifermineto a last.fm, lo tolgo
            } else{
                data =  "N/A"
                descrizione = "N/A"
            }
            let tracce = "Nessuna traccia trovata.";

            if (albumData.album.tracks && albumData.album.tracks.track) {
                tracce = albumData.album.tracks.track.map(t => `- ${t.name}`).join("\n");
            }

            let messaggio = `🎵 *${albumData.album.name}* di *${artista}*\n\n👥 Ascoltatori: ${ascoltatori}\n📅 Data di rilascio: ${data}\n🔗 [Last.fm Link](${linkStreaming})\n\n🎶 *Tracce:*\n${tracce}\n\n📖 Descrizione: ${descrizione}\n`;

            bot.sendMessage(chatId, messaggio, { parse_mode: "Markdown"});

            if (albumData.album.image && albumData.album.image.length > 0) {
                const immagine = albumData.album.image[2]["#text"];
                if (immagine) bot.sendPhoto(chatId, immagine);
            }

            const artistUrl = `http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&api_key=${apiKey}&artist=${encodeURIComponent(artista)}&format=json`;
            console.log(artistUrl)
            return fetch(artistUrl).then(r => r.json());
        })
        .then(artistData => {
            console.log(artistData);
            if (!artistData || !artistData.artist) return;

            const nomeArtista = artistData.artist.name || "Sconosciuto";
            const ascoltatoriArtista = artistData.artist.stats.listeners || "N/A";
            const linkArtista = artistData.artist.url || "N/A";
            let bio = "Biografia non disponibile.";
            if (artistData.artist.bio && artistData.artist.bio.summary) {
                bio = artistData.artist.bio.summary.split("<a")[0] //stessa cosa di prima
            }

            let messaggioArtista = `🎤 INFORMAZIONI SU *${nomeArtista}*\n\n👥 Ascoltatori: ${ascoltatoriArtista}\n🔗 [Last.fm Link](${linkArtista})\n\n📖 *Biografia:*\n${bio}`;
            bot.sendMessage(chatId, messaggioArtista, { parse_mode: "Markdown"});
        })
        .catch(error => {
            console.log("Errore durante la fetch:", error);
            bot.sendMessage(chatId, "⚠️ Errore nel recupero delle informazioni. Riprova più tardi.");
        });
});
