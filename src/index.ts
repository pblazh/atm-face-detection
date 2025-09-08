import { startServer } from "server";

function main() {
  startServer(8080).then(console.log).catch(console.error);
}

main();
