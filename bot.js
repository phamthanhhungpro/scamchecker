const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const token = '6951782011:AAGMRN-MPeIFYLyfU9CG52i49PKHHl66lLU';
const bot = new TelegramBot(token, { polling: true });

// Matches "/start"
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Use /check + [SĐT, STK hoặc facebook]. VD: /check 0334876547');
});

// Matches "/help"
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Help!');
});

// Listen for any kind of message. There are different kinds of messages.
bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  // If the message is not a command, echo the message
  if (msg.text && !msg.text.startsWith('/')) {
    bot.sendMessage(chatId, `Use /check + [SĐT, STK hoặc facebook]. VD: /check 0334876547`);
  }
});

// Matches "/check <text>"
bot.onText(/\/check (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const key = match[1]; // the captured "text"

    try {
        // Make an HTTP request to the external API
        const response = await axios.get(`http://canhbaoscam.com/api/check?key=${key}`);

        // Send the API response back to the user
        bot.sendMessage(chatId, `${response.data.value}`);
    } catch (error) {
        console.error(error);
        bot.sendMessage(chatId, 'Error occurred while calling the API');
    }
});
