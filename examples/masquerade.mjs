import "dotenv/config";
import { Client, Masquerade, Permission } from "../lib/index.mjs";

const client = new Client({ debug: true });

client.on("ready", () => console.log(`Logged in as ${client.user.username}#${client.user.discriminator}`));

client.on("messageCreate", async (message) => {
  try {
    const words = message.content.split(/\s+/);
    if (words.shift() == "!say") {
      say(message, words.join(" "));
    }
  } catch (error) {
    console.error(error);
  }
});

client.on("disconnected", () => console.log("Disconnected"));

client.loginBot(process.env.TOKEN);

process.once("SIGINT", async () => await client.logout());

// commands.js
async function say(message, text) {
  const masquerade = new Masquerade({
    name: message.author.displayName,
    avatar: message.author.avatar?.createFileURL(true),
  });

  if (!message.channel.havePermission(Permission.SendMessage)) {
    console.error("Bot does not have permission to send messages in this channel! (Channel ID: %s)", message.channelId);
    return;
  }

  if (!message.channel.havePermission(Permission.Masquerade)) {
    console.error("Bot does not have permission to masquerade in this channel! (Channel ID: %s)", message.channelId);
    await message.reply("Missing permission: Masquerade");
    return;
  }

  await message.reply({ content: text, masquerade });
}