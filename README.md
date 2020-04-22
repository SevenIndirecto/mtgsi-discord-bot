# Discord Tournament Bot

## How to use

Clone repository, make sure you have Node 12+ installed and:

```
# install dependencies
npm install
# add global typescript
npm install -g typescript

# build
npm run build

# run bot
npm start
```

## Env setup

Create a `.env` file based on `.env.example`:

```
LOGIN_TOKEN=your discord api key
OWNER=bot owner's discord id
INVITE=discord channel invite link
```

## Description

Allows running tournaments via discord.
Assumes players register using deck hashes, aka Cockatrice deck system.
