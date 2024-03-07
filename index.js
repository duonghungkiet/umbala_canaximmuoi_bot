const { Telegraf } = require("telegraf");
const xml2js = require("xml2js");

const api_link = "https://sjc.com.vn/xml/tygiavang.xml";

// fetch xml data from api_link
const { default: axios } = require("axios");

const token = "7144056280:AAF93lNz9zIDJtVh2BbIYXo8ubkRvJmQ_58";

const bot = new Telegraf(token);

bot.start((ctx) =>
  ctx.reply(
    "Chào mừng đến bot kiểm tra giá vàng của JayKit! \nGõ /kiemtragiavang để bắt đầu",
  ),
);

bot.command("kiemtragiavang", async (ctx) => {
  ctx.reply("Đang check giá vàng...");
  await fetchGoldPrice(ctx);
});

bot.launch();

async function fetchGoldPrice(ctx) {
  try {
    const response = await axios.get(api_link);
    const xmlData = await response.data;
    const chatId = ctx.chat.id;

    xml2js.parseString(xmlData, (err, result) => {
      if (err) {
        ctx.reply(chatId, "Có lỗi xảy ra khi phân tích dữ liệu.");
        return;
      }

      const title = result.root.title[0];
      const updated = result.root.ratelist[0].$.updated;

      const hcmItems = result.root.ratelist[0].city[0].item;

      let message = `<b>${title}</b>\nCập nhật: ${updated}\n--- Hồ Chí Minh ---\n`;
      hcmItems.forEach((item) => {
        message += `- <b>${item.$.type}</b>\n  + Mua: ${item.$.buy} VND\n  + Bán: ${item.$.sell} VND\n`;
      });
      ctx.reply(message, { parse_mode: "HTML" });
      ctx.reply("Chúc bạn một ngày vui!");
    });
  } catch (error) {
    ctx.reply(chatId, "Có lỗi xảy ra khi truy cập dữ liệu.");
  }
}
