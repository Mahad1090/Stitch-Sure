# Run StitchSure on your computer

You need Node.js 20 or newer (https://nodejs.org) and an internet connection for the first install.

## Steps
1. Unzip the folder, then open a terminal inside the `StitchSure` folder.
2. Install Bun (a package manager). One time only:
   `npm install -g bun`
3. Install the project's packages:
   `bun install`
4. Start the app:
   `bun run dev`
5. Open the address it prints in your browser: **http://localhost:8080**

Use `Ctrl + C` in the terminal to stop it.

If `npm install` shows the error "Cannot read properties of null (reading 'edgesOut')", that is a known npm bug with this project's lock settings. Use the Bun steps above instead.

## Other commands
- `bun run test`   runs the workflow and status tests (33 pass)
- `bun run build`  makes a production build

## Using it
- The pink "Prototype only" bar at the top is not part of the app. Its "View as" switch stands in for three people on three phones (login is simulated).
- "Reset sample" starts the story over. Refreshing the page also resets it.
- Messages and notices between customer, tailor and worker are simulated in this one page; nothing is sent.
- All names, orders and measurements are invented sample data. Nothing is saved.
