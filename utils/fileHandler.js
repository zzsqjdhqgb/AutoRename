const fs = require('fs');
const path = require('path');
const { getVideoDir } = require('./videoDir');

const RECORD_DIR = 'D:\\Record';

function renameAndMoveFile(originalFilename, date, lessonNo, lessonTag) {
  const dateStr = date.replace(/-/g, '');
  const newFilename = `${dateStr}_${lessonNo}_${lessonTag}.mkv`;
  const targetDir = path.join(RECORD_DIR, dateStr);

  // Ensure target directory exists
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const videoDir = getVideoDir();
  const sourcePath = path.join(videoDir, originalFilename);
  const targetPath = path.join(targetDir, newFilename);

  fs.renameSync(sourcePath, targetPath);
  return targetPath;
}

module.exports = { renameAndMoveFile };
