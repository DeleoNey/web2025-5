const http = require("http");
const { Command } = require("commander");
const fs = require("fs");
const path = require("path");

const program = new Command();

program
  .requiredOption("-h, --host <host>", "Server host")
  .requiredOption("-p, --port <port>", "Server port")
  .requiredOption("-c, --cache <cacheDir>", "Cache directory");

program.parse(process.argv);

const options = program.opts();
const { host, port, cache } = options;

// Перевірка чи існує директорія кешу, якщо ні - створити
if (!fs.existsSync(cache)) {
  fs.mkdirSync(cache, { recursive: true });
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Сервер працює!");
});

server.listen(port, host, () => {
  console.log(`Сервер запущено на http://${host}:${port}`);
});
