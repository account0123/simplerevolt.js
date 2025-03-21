# revolt.js
Javascript library for interacting to Revolt API.

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

### CommonJS
```js
const { Client } = require("..");

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