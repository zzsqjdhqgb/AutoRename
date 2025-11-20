const dateInput = document.getElementById('date');
const lessonNoInput = document.getElementById('lessonNo');
const lessonTagSelect = document.getElementById('lessonTag');
const confirmBtn = document.getElementById('confirmBtn');
const skipBtn = document.getElementById('skipBtn');
const videoPlayer = document.getElementById('videoPlayer');

let currentFile = null;

// Load next file on app start
window.addEventListener('DOMContentLoaded', () => {
  loadNextFile();
});

async function loadNextFile() {
  currentFile = await window.electronAPI.invoke('get-next-file');
  if (currentFile) {
    // Extract date from filename
    const dateMatch = currentFile.match(/^(\d{4}-\d{2}-\d{2}) /);
    if (dateMatch) {
      dateInput.value = dateMatch[1];
    }
    // Get video path from main process
    const videoPath = await window.electronAPI.invoke('get-video-path', currentFile);
    videoPlayer.src = videoPath;
  } else {
    alert('No more files to process');
  }
}

confirmBtn.addEventListener('click', async () => {
  const date = dateInput.value;
  const lessonNo = lessonNoInput.value;
  const lessonTag = lessonTagSelect.value;

  try {
    await window.electronAPI.invoke('confirm-file', { filename: currentFile, date, lessonNo, lessonTag });
    loadNextFile();
  } catch (error) {
    alert('Error: ' + error.message);
  }
});

skipBtn.addEventListener('click', async () => {
  await window.electronAPI.invoke('skip-file', currentFile);
  loadNextFile();
});
