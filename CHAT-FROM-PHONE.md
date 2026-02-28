# Chat with the agent from your phone

Use the mux mobile app to talk to an agent while the mux server runs on your computer.

## 1. Run the mux server so the phone can reach it

Your phone cannot use `localhost`; it must use your computer’s IP. Bind the server to all interfaces:

```bash
# No auth (typical for same Wi‑Fi / trusted network)
make dev-server BACKEND_HOST=0.0.0.0 BACKEND_PORT=3000
```

For auth (e.g. over Tailscale), the dev-server Makefile uses `--no-auth`. Run the server manually with auth instead:

```bash
make build-main
MUX_SERVER_AUTH_TOKEN=your_token NODE_ENV=development node dist/cli/index.js server --host 0.0.0.0 --port 3000
```

The server will print the URL and, if using auth, how to pass the token.

## 2. Base URL your phone will use

- **Same Wi‑Fi:** Your machine’s LAN IP (e.g. `192.168.1.10`).
- **Tailscale:** Your Tailscale IP (e.g. `100.x.x.x`).

Use: `http://<that-ip>:3000` (no trailing slash; use the port you chose).

## 3. Run the mobile app on your phone

- **Expo Go (quick):** From the repo root, `cd mobile && bun install && bun start`, then scan the QR code with Expo Go (SDK 54).
- **Dev build (recommended):** `cd mobile && bunx expo run:ios` or `bunx expo run:android` with device or simulator connected.

## 4. Point the app at your server

In the app, open **Settings** and set:

- **Base URL** → `http://<your-ip>:3000`
- **Auth token** → leave empty unless you started the server with `MUX_SERVER_AUTH_TOKEN` (or a printed token).

Settings are saved. You may need to restart the app for the server URL to take effect.

## 5. Chat

Open the app, pick or create a workspace, and chat. The agent runs on your server; the phone is the client.

For more (Expo Go limits, dev builds, web testing), see [mobile/README.md](mobile/README.md).
