"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
function main() {
    (0, server_1.startServer)(8080).then(console.log).catch(console.error);
}
main();
//# sourceMappingURL=index.js.map