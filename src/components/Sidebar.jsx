import React from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import Select from 'react-select';
import "react-datepicker/dist/react-datepicker.css";
import { zhCN } from 'date-fns/locale';

registerLocale('zh-CN', zhCN);

const lessonOptions = [
  { value: '语文', label: '语文' },
  { value: '数学', label: '数学' },
  { value: '英语', label: '英语' },
  { value: '物理', label: '物理' },
  { value: '化学', label: '化学' },
  { value: '生物', label: '生物' },
  { value: '体育', label: '体育' },
  { value: '思政', label: '思政' },
];

function Sidebar({ 
  date, 
  setDate, 
  lessonNo, 
  setLessonNo, 
  lessonTag, 
  setLessonTag, 
  onConfirm, 
  onSkip,
  isProcessing 
}) {
  // Helper to convert string "YYYY-MM-DD" to Date object
  const getDateObject = (dateString) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Helper to convert Date object to "YYYY-MM-DD"
  const formatDate = (dateObj) => {
    if (!dateObj) return '';
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      borderRadius: '8px',
      borderColor: state.isFocused ? '#2563eb' : '#e5e7eb',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(37, 99, 235, 0.2)' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#2563eb' : '#d1d5db'
      },
      padding: '2px'
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#2563eb' : state.isFocused ? '#eff6ff' : 'white',
      color: state.isSelected ? 'white' : '#1f2937',
      cursor: 'pointer'
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999
    })
  };

  return (
    <div className="left-panel">
      <div className="app-header">
        <img src="assets/icon.svg" alt="Logo" className="app-logo" />
        <h1 className="app-title">AutoRename</h1>
      </div>
      
      <div className="form-container">
        <div className="form-group">
          <label htmlFor="date">日期</label>
          <DatePicker
            selected={getDateObject(date)}
            onChange={(date) => setDate(formatDate(date))}
            dateFormat="yyyy-MM-dd"
            locale="zh-CN"
            className="custom-datepicker"
            placeholderText="选择日期"
            disabled={isProcessing}
            wrapperClassName="datepicker-wrapper"
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
            disabled={isProcessing}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onConfirm();
            }}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="lessonTag">课程标签</label>
          <Select
            id="lessonTag"
            value={lessonOptions.find(opt => opt.value === lessonTag)}
            onChange={(option) => setLessonTag(option.value)}
            options={lessonOptions}
            isDisabled={isProcessing}
            styles={customSelectStyles}
            placeholder="选择课程"
            isSearchable={false}
          />
        </div>
      </div>

      <div className="actions">
        <button 
          id="skipBtn" 
          onClick={onSkip} 
          disabled={isProcessing}
          title="快捷键: Esc"
        >
          跳过
        </button>
        <button 
          id="confirmBtn" 
          onClick={onConfirm} 
          disabled={isProcessing || !date || !lessonNo}
          title="快捷键: Enter"
        >
          {isProcessing ? '处理中...' : '确认重命名'}
        </button>
      </div>
      
      <div className="shortcuts-hint">
        <span>↵ 确认</span>
        <span>Esc 跳过</span>
      </div>
    </div>
  );
}

export default Sidebar;