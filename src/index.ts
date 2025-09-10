import { logError, logInfo } from "./logger";
import { startServer } from "./server";

const DEFAULT_PORT = "8080";
const RESTART_DELAY = 1000;

function sleep(ms: number = 1000): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function startLoop() {
  const port = parseInt(process.env["PORT"] || DEFAULT_PORT);
  while (true) {
    try {
      await startServer(port);
    } catch (err) {
      logError(err instanceof Error ? err : new Error("Closed clean"));
    }

    logInfo({ message: "RESTARTING" });
    await sleep(RESTART_DELAY);
  }
}

function main() {
  startLoop().catch(console.error);
}
main();
