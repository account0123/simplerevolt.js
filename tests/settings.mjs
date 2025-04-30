import "dotenv/config";
import { Client } from "../lib/esm/index.js";
import assert from "node:assert";

const client = new Client();

client.on("ready", async () => {
  // Prepare settings
  const timestamp = Date.now();
  await client.syncSettings.save({ test: { message: "This is a test"} }, timestamp);

  // Fetch settings
  const settings = await client.syncSettings.fetch(["test"]);
  assert.strictEqual(settings.test.timestamp, timestamp);
  console.debug(settings);
});
client.loginBot(process.env.TOKEN);
