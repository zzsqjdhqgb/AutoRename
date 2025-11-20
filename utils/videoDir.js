const path = require('path');
// const { getPath } = require('platform-folders');

function getVideoDir() {
  // Try environment variable first
  const envVideoDir = process.env.VIDEO_DIR;
  if (envVideoDir) {
    return envVideoDir;
  }

  // Use system Videos folder
  try {
    const { app } = require('electron');
    return app.getPath('videos');
  } catch (err) {
    // Fallback to default location
    // return path.join(require('os').homedir(), 'Videos');
    return "FAILED TO GET PATH";
  }
}

module.exports = { getVideoDir };
