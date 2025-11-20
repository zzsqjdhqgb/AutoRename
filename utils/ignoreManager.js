const fs = require('fs');
const path = require('path');
const { getVideoDir } = require('./videoDir')

const VIDEO_DIR = getVideoDir();
const IGNORE_FILE = path.join(VIDEO_DIR, 'ignore.json');

function getIgnoredFiles() {
  try {
    const data = fs.readFileSync(IGNORE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function addToIgnore(filename) {
  const ignored = getIgnoredFiles();
  if (!ignored.includes(filename)) {
    ignored.push(filename);
    fs.writeFileSync(IGNORE_FILE, JSON.stringify(ignored, null, 2));
  }
}

module.exports = { addToIgnore, getIgnoredFiles };
