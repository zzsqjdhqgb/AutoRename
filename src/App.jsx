import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';

function App() {
  const [currentFile, setCurrentFile] = useState(null);
  const [date, setDate] = useState('');
  const [lessonNo, setLessonNo] = useState('');
  const [lessonTag, setLessonTag] = useState('语文');
  const videoRef = useRef(null);

  useEffect(() => {
    loadNextFile();
  }, []);

  const loadNextFile = async () => {
    try {
      const file = await window.electronAPI.invoke('get-next-file');
      setCurrentFile(file);

      if (file) {
        // Extract date from filename
        const dateMatch = file.match(/^(\d{4}-\d{2}-\d{2}) /);
        if (dateMatch) {
          setDate(dateMatch[1]);
        }
        
        // Get video path
        const videoPath = await window.electronAPI.invoke('get-video-path', file);
        if (videoRef.current) {
          videoRef.current.src = videoPath;
        }
      } else {
        Swal.fire({
          title: '完成!',
          text: '没有更多文件需要处理了',
          icon: 'success',
          confirmButtonText: '好的'
        });
      }
    } catch (error) {
      console.error('Error loading file:', error);
    }
  };

  const handleConfirm = async () => {
    if (!currentFile) return;

    try {
      // Stop video playback to release file lock
      if (videoRef.current) {
        videoRef.current.src = '';
      }

      await window.electronAPI.invoke('confirm-file', { 
        filename: currentFile, 
        date, 
        lessonNo, 
        lessonTag 
      });

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

      // Reset form partially (keep date maybe? logic from original was just reload)
      // Original logic didn't reset form explicitly, just reloaded next file which might overwrite date
      setLessonNo(''); 
      
      loadNextFile();
    } catch (error) {
      Swal.fire({
        title: '错误!',
        text: error.message,
        icon: 'error',
        confirmButtonText: '关闭'
      });
    }
  };

  const handleSkip = async () => {
    if (!currentFile) return;
    await window.electronAPI.invoke('skip-file', currentFile);
    loadNextFile();
  };

  return (
    <div className="container">
      <div className="left-panel">
        <div className="app-header">
          <img src="assets/icon.svg" alt="Logo" className="app-logo" />
          <h1 className="app-title">AutoRename</h1>
        </div>
        
        <div className="form-group">
          <label htmlFor="date">日期</label>
          <input 
            type="date" 
            id="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="lessonNo">课时序号 (1-9)</label>
          <input 
            type="number" 
            id="lessonNo" 
            min="1" 
            max="9" 
            placeholder="例如: 1" 
            value={lessonNo}
            onChange={(e) => setLessonNo(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="lessonTag">课程标签</label>
          <select 
            id="lessonTag" 
            value={lessonTag} 
            onChange={(e) => setLessonTag(e.target.value)}
          >
            <option value="语文">语文</option>
            <option value="数学">数学</option>
            <option value="英语">英语</option>
            <option value="物理">物理</option>
            <option value="化学">化学</option>
            <option value="生物">生物</option>
            <option value="体育">体育</option>
            <option value="思政">思政</option>
          </select>
        </div>

        <div className="actions">
          <button id="skipBtn" onClick={handleSkip}>跳过</button>
          <button id="confirmBtn" onClick={handleConfirm}>确认重命名</button>
        </div>
      </div>

      <div className="right-panel">
        <div className="preview-card">
          <video id="videoPlayer" controls ref={videoRef}>
            您的浏览器不支持 video 标签。
          </video>
        </div>
      </div>
    </div>
  );
}

export default App;