# Reaktor-backend

## API

### GET https://reaktor-backend.fly.dev/

Tests if the backend works and returns a short string.

### GET https://reaktor-backend.fly.dev/drones

Fetches reaktor pre-assignment api to get a list of drones and calculate
which of the drones are crossing a "no-fly" zone. The reaktor api updates every 2 seconds, but for
sake of money this automatically updates every 5s in the background, but instantly fetches if
the url is requested.

## Install dependencies

```bash
yarn install
```

## Run in dev mode
```bash
yarn run dev
```

## Run in "production"
```bash
yarn run start
```

## Deployment
Deployed at https://reaktor-backend.fly.dev/
