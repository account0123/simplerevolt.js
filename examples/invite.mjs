import { Client } from "../lib/index.js";

const client = new Client({ debug: true });
const code = "Testers";

client
  .fetchFullInvite(code)
  .then((invite) => console.log("Server name: %s\nMember count: %d", invite.serverData.name, invite.memberCount))
  .catch(console.error);
