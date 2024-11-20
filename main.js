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
    const dirExists = await fs.access(dirPath).then(() => true).catch(() => false);
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

let notes = {};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/notes/:name', (req, res) => {
  const { name } = req.params;
  if (notes[name]) {
    return res.status(200).send(notes[name]);
  } else {
    return res.status(404).send('Not found');
  }
});

app.put('/notes/:name', (req, res) => {
  const { name } = req.params;
  const { text } = req.body;
  if (notes[name]) {
    notes[name] = text;
    return res.status(200).send('Note updated');
  } else {
    return res.status(404).send('Not found');
  }
});

app.delete('/notes/:name', (req, res) => {
  const { name } = req.params;
  if (notes[name]) {
    delete notes[name];
    return res.status(200).send('Note deleted');
  } else {
    return res.status(404).send('Not found');
  }
});

app.get('/notes', (req, res) => {
  const notesList = Object.keys(notes).map(name => ({
    name,
    text: notes[name]
  }));
  return res.status(200).json(notesList);
});

app.post('/write', (req, res) => {
  const { note_name, note } = req.body;
  if (notes[note_name]) {
    return res.status(400).send('Bad Request');
  }
  notes[note_name] = note;
  return res.status(201).send('Note created');
});

app.get('/UploadForm.html', (req, res) => {
  res.status(200).send(`
    <html>
      <body>
        <form action="/write" method="POST" enctype="multipart/form-data">
          <label for="note_name">Note Name:</label><br>
          <input type="text" id="note_name" name="note_name" required><br><br>
          <label for="note">Note Text:</label><br>
          <textarea id="note" name="note" required></textarea><br><br>
          <button type="submit">Submit</button>
        </form>
      </body>
    </html>
  `);
});

app.listen(port, host, () => {
  console.log(`Сервер запущено на http://${host}:${port}`);
});
