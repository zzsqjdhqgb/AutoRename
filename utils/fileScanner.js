const fs = require('fs');
const path = require('path');
const { getVideoDir } = require('./videoDir.js');
const { isIgnored } = require('./ignoreManager.js');

function scanFiles() {
  const videoDir = getVideoDir();
  const files = fs.readdirSync(videoDir).filter(file => {
    return /^(\d{4}-\d{2}-\d{2} \d{2}-\d{2}-\d{2})\.mkv$/.test(file) && !isIgnored(file);
  });
  return files.sort(); // Sort alphabetically for consistent order
}

module.exports = { scanFiles };
