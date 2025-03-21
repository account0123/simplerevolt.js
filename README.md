# Simple revolt.js

![simplerevolt.js](https://img.shields.io/npm/v/simplerevolt.js) ![revolt-api](https://img.shields.io/npm/v/revolt-api?label=Revolt%20API)
Javascript library that allows you to easily interact with the [Revolt API](https://developers.revolt.chat/developers/api/reference).

## Installation

npm:
```sh
npm i simplerevolt.js
```

pnpm:
```sh
pnpm add simplerevolt.js
```

yarn:
```sh
yarn add simplerevolt.js
```

## Usage

```js
// esm / typescript
import { Client } from "simplerevolt.js";
// ...or commonjs
const { Client } = require("simplerevolt.js");

const client = new Client({
  // Enables debug logging
  debug: true,
  // ...
});

client.on("ready", () => console.log(`Logged in as ${client.user.username}#${client.user.discriminator}`));

client.on("messageCreate", (message) => console.log(`${message.author.username}#${message.author.discriminator}: ${message.content}`));

client.on("disconnected", () => console.log("Disconnected"));

client.loginBot("YOUR_TOKEN_HERE");
```

## Revolt API types

> [!WARNING]
> It is advised you do not use this unless necessary. If you find somewhere that isn't covered by the library, please open an issue as this library aims to transform all objects.

All `revolt-api` types are re-exported from this library under `API`.

```typescript
import { API } from "simplerevolt.js";

// API.Channel;
// API.[..];
```

## Troubleshooting

#### cp is not recognized (Windows)
```sh
> tsc && cp package-esm.json lib/esm/package.json
"cp" is not recognized as an internal or external command
```

pnpm executes `cp` as a shell command, which is not recognized by Windows default shell. You can fix it by adding Git shell to ~/.npmrc:
```sh
script-shell=C:\Program Files\Git\bin\bash.exe
```