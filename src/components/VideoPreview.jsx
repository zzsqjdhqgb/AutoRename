import React from 'react';

function VideoPreview({ currentFile, isProcessing }) {
  if (!currentFile) {
    return (
      <div className="right-panel">
        <div className="empty-state">
          <div className="empty-icon">📂</div>
          <h2>没有待处理的文件</h2>
          <p>请将视频文件放入待处理文件夹</p>
        </div>
      </div>
    );
  }

  return (
    <div className="right-panel">
      <div className="video-container">
        {!isProcessing ? (
          <video 
            key={currentFile.path} // Force re-render when file changes
            controls 
            autoPlay 
            src={currentFile.videoUrl}
          >
            您的浏览器不支持视频播放。
          </video>
        ) : (
          <div className="processing-state">
            <div className="loading-spinner">🔄</div>
            <p>正在处理文件...</p>
          </div>
        )}
      </div>
      <div className="file-info">
        <h3>当前文件</h3>
        <p className="filename">{currentFile.name}</p>
        <p className="filepath">{currentFile.path}</p>
      </div>
    </div>
  );
}

export default VideoPreview;