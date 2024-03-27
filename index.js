const express = require("express");
const app = express();
const axios = require("axios");
const port = 3002;
const Telegrambot = require("node-telegram-bot-api");
require("dotenv").config();

const bottoken = process.env.BOT_TOKEN;
const bot = new Telegrambot(bottoken, { polling: true });
const time = (dater) => {
  const datee = new Date(dater);
  const date = datee.toLocaleDateString("en-US");
  const time = datee.toLocaleTimeString("en-US");
  return `${date} ${time}`;
};

bot.onText(/\/display/, (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
});

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const message = msg.text;
  const username = msg.from.username;

  if (message.startsWith("/authenticate")) {
    // Ignore the command if it was already handled above
    return;
  }
  if (
    msg.reply_to_message &&
    msg.reply_to_message.text === "Please enter your Twitter username:"
  ) {
    const checkSql = `SELECT * FROM telebot WHERE chat_id = ?`;
    db.query(checkSql, [chatId], (err, results) => {
      if (err) {
        console.error(err);
      } else {
        if (results.length > 0) {
          // User is already registered
          bot.sendMessage(
            chatId,
            "*You are already registered.*\n\n Use the Display button to check your current rank."
          );
        } else {
          const sql = `INSERT INTO telebot (username, chat_id) VALUES (?, ?)`;
          db.query(sql, [username, chatId], (err, results) => {
            if (err) {
              console.error(err);
            } else {
              console.log("Successfully added" + results);
              bot
                .sendPhoto(chatId, "https://ibb.co/1rdtMH8", {
                  caption: "🎉🎉Success🎉🎉Your username is verified!",
                })
                .then(() => {
                  return bot.sendMessage(
                    chatId,
                    "Enter Your Ethereum($Eth) Address"
                  );
                });
            }
          });
        }
      }
    });
  }
});

bot.onText(/\/latest/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const response = await axios.get("https://api.coinpaprika.com/v1/tickers");
    const data = response.data;
    data.sort((a, b) => new Date(b.first_data_at) - new Date(a.first_data_at));
    const latestFive = data.slice(0, 5);
    console.log(latestFive);
    latestFive.reverse().forEach((item) => {
      console.log(item.quotes);
      const message = `
      📊 *Name:* ${item.name}

      💰 *Symbol:* $${item.symbol}
      
      💵 *Price:* $${Number(item.quotes.USD.price.toFixed(4))}
      
      📈 *Total Supply:* ${item.total_supply}
      
      🚀 *Max Supply:* ${item.max_supply}
      
      📉 *Beta Value:* ${item.beta_value}
      
      📅 *Listing Date:* ${time(item.first_data_at)}
      
      🔄 *Last update:* ${time(item.last_updated)}
      
      💹 *Market Cap:* ${item.quotes.USD.market_cap}
      
    `;
      bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
    });
  } catch (error) {
    console.log(error);
  }
});

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  const inlineKeyboard = [
    [{ text: "🔥Check out the creator🔥", url: "https://x.com/gloriousreborne" }],
  ];
  const message = `🔥🔥Welcome to Coin Trackerbot , You can use this to check out the latest listed tokens , and rank them by their market cap value, It returns the highest 10 results`;
  const messageoptions = {
    reply_markup: {
      inline_keyboard: inlineKeyboard,
    },
  };

  bot.sendMessage(chatId, message, messageoptions);
  console.log("sent!");
});

bot.on("message", (msg) => {
  const idan = msg.chat.username;
  const chatId = msg.chat.id;
  const text = msg.text;
  if (text.toLowerCase() === `hello`) {
    bot.sendMessage(chatId, "Focus on the issue on ground" + " " + "@" + idan);
    console.log("sent it");
  } else if (text.toLowerCase() === `hello`) {
    bot.sendMessage(
      chatId,
      "you sef suppose sabi how to follow person talk" + " " + "@" + idan
    );
    console.log("sent it");
  } else {
    console.log(msg.text);
  }
});

bot.on("polling_error", console.log);

app.listen(port, () => {
  console.log(`server listening at ${port}`);
});
