require("dotenv").config();
const { Client } = require("..");

const client = new Client({ debug: true });

client.on("ready", () => console.log(`Logged in as ${client.user.username}#${client.user.discriminator}`));

client.on("messageCreate", async (message) => {
  console.log(`${message.author.username}#${message.author.discriminator}: ${message.content}`);

  try {
    if (message.content == "!ping") {
      await message.reply("Pong!");
    }
  } catch (error) {
    console.error(error);
  }
});

client.on("disconnected", () => console.log("Disconnected"));

client.loginBot(process.env.TOKEN);
