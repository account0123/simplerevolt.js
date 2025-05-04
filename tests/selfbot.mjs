import "dotenv/config";
import { Client, Permission } from "../lib/index.js";

const { ACCOUNT_EMAIL: email, ACCOUNT_PASSWORD: password, OS } = process.env;
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

client.login({ email, password, friendly_name: `Node.js on ${OS}` }).then(result => {
  if (result?.callback) {
    console.log("Required onboarding");
    // result.callback("your_username");
  }
  console.log("Authenticated");
}).catch(console.error);
