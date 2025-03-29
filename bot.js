const fs = require('fs')
const TelegramBot = require('node-telegram-bot-api');
const conf = JSON.parse(fs.readFileSync('conf.json'))
const token = conf.key;
const bot = new TelegramBot(token, {polling: true})

bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;0
    if (text === '/start'){
        bot.sendMessage(chatId, "Ti ammazzo zio");
    }
    if (text.includes("juventus")){
        bot.sendMessage(chatId, "Squadra di gay")
    }
    if (text.includes("999")){
        bot.sendPhoto(chatId,"https://static1.squarespace.com/static/6091d047f84a401eacaf886f/60a426d74444ce2a8b0f5db6/65f06c632b3e9c0632e5c0d1/1710363728889/article+cover+collage.JPG?format=1500w" )
    }


})