const fs = require('fs').promises;
const express = require('express');
const { Command } = require('commander');

const program = new Command();

program
  .requiredOption('-h, --host <host>', 'Адреса сервера')
  .requiredOption('-p, --port <port>', 'Порт сервера')
  .requiredOption('-c, --cache <cache>', 'Шлях до директорії для кешованих файлів')
  .parse(process.argv);

const { host, port, cache } = program.opts();

async function createDirectoryIfNotExists(dirPath) {
  try {
    
    
    if (dirExists) {
      console.log(`Директорія '${dirPath}' вже існує.`);
    } else {
  
      await fs.mkdir(dirPath, { recursive: true });
      console.log(`Директорія '${dirPath}' створена.`);
    }
  } catch (error) {
    console.error('Помилка при доступі до директорії:', error);
  }
} 

createDirectoryIfNotExists(cache);

const app = express();

app.listen(port, host, () => {
  console.log(`Сервер запущено на http://${host}:${port}`);
});
