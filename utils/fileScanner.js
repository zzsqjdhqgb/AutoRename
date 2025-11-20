const fs = require('fs');
const path = require('path');
const { getPath } = require('platform-folders');

function getVideoDir() {
  // Try environment variable first
  const envVideoDir = process.env.VIDEO_DIR;
  if (envVideoDir) {
    return envVideoDir;
  }

  // Use system Videos folder
  try {
    return getPath('videos');
  } catch (err) {
    // Fallback to default location
    return path.join(require('os').homedir(), 'Videos');
  }
}

const VIDEO_DIR = getVideoDir();
const IGNORE_FILE = path.join(VIDEO_DIR, 'ignore.json');

// Regex for YYYY-MM-DD hh-mm-ss.mkv
const FILE_PATTERN = /^\d{4}-\d{2}-\d{2} \d{2}-\d{2}-\d{2}\.mkv$/;

function getIgnoredFiles() {
  try {
    const data = fs.readFileSync(IGNORE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function scanFiles() {
  const ignored = getIgnoredFiles();
  const files = fs.readdirSync(VIDEO_DIR);
  const validFiles = [];
  const invalidFiles = [];

  files.forEach(file => {
    if (FILE_PATTERN.test(file)) {
      if (!ignored.includes(file)) {
        validFiles.push(file);
      }
    } else {
      invalidFiles.push(file);
    }
  });

  // Log invalid files
  if (invalidFiles.length > 0) {
    console.log('Skipped files: ', invalidFiles);
  }

  return validFiles;
}

module.exports = { scanFiles, getIgnoredFiles };
