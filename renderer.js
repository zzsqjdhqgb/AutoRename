const dateInput = document.getElementById('date');
const lessonNoInput = document.getElementById('lessonNo');
const lessonTagSelect = document.getElementById('lessonTag');
const confirmBtn = document.getElementById('confirmBtn');
const skipBtn = document.getElementById('skipBtn');
const videoPlayer = document.getElementById('videoPlayer');
const Swal = require('sweetalert2');

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
    Swal.fire({
      title: '完成!',
      text: '没有更多文件需要处理了',
      icon: 'success',
      confirmButtonText: '好的'
    });
  }
}

confirmBtn.addEventListener('click', async () => {
  const date = dateInput.value;
  const lessonNo = lessonNoInput.value;
  const lessonTag = lessonTagSelect.value;

  try {
    // Stop video playback to release file lock before moving
    videoPlayer.src = '';
    await window.electronAPI.invoke('confirm-file', { filename: currentFile, date, lessonNo, lessonTag });
    
    // Show success toast
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    });
    
    Toast.fire({
      icon: 'success',
      title: '重命名成功'
    });

    loadNextFile();
  } catch (error) {
    Swal.fire({
      title: '错误!',
      text: error.message,
      icon: 'error',
      confirmButtonText: '关闭'
    });
  }
});

skipBtn.addEventListener('click', async () => {
  await window.electronAPI.invoke('skip-file', currentFile);
  loadNextFile();
});
