import "dotenv/config";
import { Client, Permission } from "../lib/esm/index.js";

const client = new Client({ debug: true });

client.on("ready", () => console.log(`Logged in as ${client.user.username}#${client.user.discriminator}`));

client.on("messageCreate", async (message) => {
  console.log(`${message.author.username}#${message.author.discriminator}: ${message.content}`);

  try {
    if (message.content == "!ping") {
      if (!message.channel.havePermission(Permission.SendMessage)) {
        console.error("Bot does not have permission to send messages in this channel! (Channel ID: %s)", message.channelId);
        return;
      }
      await message.reply("Pong!");
    }
  } catch (error) {
    console.error(error);
  }
});

client.on("disconnected", () => console.log("Disconnected"));

client.login(process.env.USER_TOKEN).then(result => {
  if (result.callback) {
    result.callback("username").then(user => console.log(`Completed onboarding as ${user.username}#${user.discriminator}`));
  }
  console.log("Authenticated");
});
