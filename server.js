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

const { promises: fsPromises } = require("fs");

const server = http.createServer(async (req, res) => {
  const urlParts = req.url.split("/");

  // Перевірка на правильний формат запиту
  if (urlParts.length < 2 || isNaN(urlParts[1])) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("Invalid request");
    return;
  }

  const statusCode = urlParts[1];
  const filePath = path.join(cache, `${statusCode}.jpg`);

  // Обробка запитів GET, PUT, DELETE
  try {
    if (req.method === "GET") {
      try {
        const fileData = await fsPromises.readFile(filePath);
        res.writeHead(200, { "Content-Type": "image/jpeg" });
        res.end(fileData);
      } catch (err) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("File not found");
      }
    } else if (req.method === "PUT") {
      const fileStream = fs.createWriteStream(filePath);
      req.pipe(fileStream);
      req.on("finish", () => {
        res.writeHead(201, { "Content-Type": "text/plain" });
        res.end("File saved");
      });
    } else if (req.method === "DELETE") {
      try {
        await fsPromises.unlink(filePath);
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("File deleted");
      } catch (err) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("File not found");
      }
    } else {
      res.writeHead(405, { "Content-Type": "text/plain" });
      res.end("Method not allowed");
    }
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Server error");
  }
});

server.listen(port, host, () => {
  console.log(`Сервер запущено на http://${host}:${port}`);
});
