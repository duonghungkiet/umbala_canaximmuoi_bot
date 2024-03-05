const telegram_bot = require("node-telegram-bot-api");
const xml2js = require("xml2js");

const api_link = "https://sjc.com.vn/xml/tygiavang.xml";

// fetch xml data from api_link
const { default: axios } = require("axios");

const token = "7144056280:AAF93lNz9zIDJtVh2BbIYXo8ubkRvJmQ_58";

const bot = new telegram_bot(token, { polling: true });

bot.on("polling_error", (msg) => console.log(msg));

bot.on("message", (msg) => {
  const chatId = msg.chat.id;

  if (msg.text.toLowerCase() === "/start") {
    const replyKeyboardMarkup = {
      keyboard: [
        ["Kiểm tra giá vàng"], // Nút lệnh 1
        ["Lệnh khác"], // Nút lệnh 2, bạn có thể thêm nhiều lệnh tùy ý
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    };

    bot.sendMessage(chatId, "Chọn một lệnh:", {
      reply_markup: replyKeyboardMarkup,
    });
  } else if (msg.text === "Kiểm tra giá vàng") {
    fetchGoldPrice(chatId);
  } else if (msg.text === "Lệnh khác") {
    bot.sendMessage(chatId, "Veleoo");
  }
});

async function fetchGoldPrice(chatId) {
  try {
    const response = await axios.get(api_link);
    const xmlData = await response.data;

    xml2js.parseString(xmlData, (err, result) => {
      if (err) {
        bot.sendMessage(chatId, "Có lỗi xảy ra khi phân tích dữ liệu.");
        return;
      }

      const title = result.root.title[0];
      const updated = result.root.ratelist[0].$.updated;

      const hcmItems = result.root.ratelist[0].city[0].item;

      let message = `<b>${title}</b>\nCập nhật: ${updated}\n--- Hồ Chí Minh ---\n`;
      hcmItems.forEach((item) => {
        message += `- <b>${item.$.type}</b>\n  + Mua: ${item.$.buy} VND\n  + Bán: ${item.$.sell} VND\n`;
      });

      bot.sendMessage(chatId, message, { parse_mode: "HTML" });
    });
  } catch (error) {
    console.error("Có lỗi xảy ra:", error);
    bot.sendMessage(chatId, "Có lỗi xảy ra khi truy cập dữ liệu.");
  }
}
