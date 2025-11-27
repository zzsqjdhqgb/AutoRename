import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import Sidebar from './components/Sidebar';
import VideoPreview from './components/VideoPreview';

// Configure SweetAlert2 to not modify body height
const MySwal = Swal.mixin({
  heightAuto: false
});

function App() {
  const [currentFile, setCurrentFile] = useState(null);
  const [date, setDate] = useState('');
  const [lessonNo, setLessonNo] = useState('');
  const [lessonTag, setLessonTag] = useState('语文');
  const [isProcessing, setIsProcessing] = useState(false);

  const loadNextFile = useCallback(async () => {
    try {
      const filename = await window.electronAPI.invoke('get-next-file');
      
      if (filename) {
        // Extract date from filename
        const dateMatch = filename.match(/^(\d{4}-\d{2}-\d{2}) /);
        if (dateMatch) {
          setDate(dateMatch[1]);
        }
        
        // Get video path
        const videoUrl = await window.electronAPI.invoke('get-video-path', filename);
        
        setCurrentFile({
          name: filename,
          path: videoUrl,
          videoUrl: videoUrl
        });
      } else {
        setCurrentFile(null);
        MySwal.fire({
          title: '完成!',
          text: '没有更多文件需要处理了',
          icon: 'success',
          confirmButtonText: '好的'
        });
      }
    } catch (error) {
      console.error('Error loading file:', error);
      MySwal.fire({
        title: '错误',
        text: '加载文件失败: ' + error.message,
        icon: 'error'
      });
    }
  }, []);

  useEffect(() => {
    loadNextFile();
  }, [loadNextFile]);

  const handleConfirm = async () => {
    if (!currentFile || isProcessing) return;
    if (!date || !lessonNo) {
      MySwal.fire({
        title: '提示',
        text: '请填写日期和课时序号',
        icon: 'warning',
        timer: 1500
      });
      return;
    }

    setIsProcessing(true);
    try {
      const result = await window.electronAPI.invoke('confirm-file', { 
        filename: currentFile.name, 
        date, 
        lessonNo, 
        lessonTag 
      });

      if (result.success) {
        // Show success toast
        const Toast = MySwal.mixin({
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

        // Auto increment lesson number (cycle 1-9)
        const currentVal = parseInt(lessonNo || '0', 10);
        let nextVal = currentVal + 1;
        if (nextVal > 9) nextVal = 1;
        setLessonNo(String(nextVal));
        
        await loadNextFile();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      MySwal.fire({
        title: '错误!',
        text: error.message,
        icon: 'error',
        confirmButtonText: '关闭'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkip = async () => {
    if (!currentFile || isProcessing) return;
    
    setIsProcessing(true);
    try {
      await window.electronAPI.invoke('skip-file', currentFile.name);
      await loadNextFile();
    } catch (error) {
      console.error('Error skipping file:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isProcessing) return;
      
      // Ctrl+Enter to confirm
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleConfirm();
      }

      // F5 to refresh file list
      if (e.key === 'F5') {
        e.preventDefault();
        loadNextFile();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isProcessing, currentFile, handleConfirm, loadNextFile]);

  return (
    <div className="container">
      <Sidebar 
        date={date}
        setDate={setDate}
        lessonNo={lessonNo}
        setLessonNo={setLessonNo}
        lessonTag={lessonTag}
        setLessonTag={setLessonTag}
        onConfirm={handleConfirm}
        onSkip={handleSkip}
        onRefresh={loadNextFile}
        isProcessing={isProcessing}
      />
      <VideoPreview currentFile={currentFile} />
    </div>
  );
}

export default App;