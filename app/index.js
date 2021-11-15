import ConsoleServer from "./ConsoleServer.js";

const server = new ConsoleServer();
setInterval(() => {
  server.fetchLines();
}, 1500);
// setInterval(checkForDisconnectedClients, 30000);
