/**
 * @fileoverview 文件上传组件 - 支持多种文件类型、拖放上传、进度显示
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-20
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

'use client';

import * as React from 'react';
import { Upload, X, FileText, Image, Video, Music, AlertCircle } from 'lucide-react';

export interface FileUploadConfig {
  maxSize?: number;
  allowedTypes?: string[];
  multiple?: boolean;
}

export interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

interface FileUploadProps {
  config?: FileUploadConfig;
  onUpload?: (files: UploadedFile[]) => void;
  onRemove?: (fileId: string) => void;
  className?: string;
}

const DEFAULT_CONFIG: FileUploadConfig = {
  maxSize: 20 * 1024 * 1024, // 20MB
  allowedTypes: [
    // 文档类
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt',
    // 图片类
    '.jpg', '.jpeg', '.png', '.gif', '.webp',
    // 视频类
    '.mp4', '.mov', '.avi', '.mkv',
    // 音频类
    '.mp3', '.wav', '.m4a', '.aac'
  ],
  multiple: true
};

export const FileUpload: React.FC<FileUploadProps> = ({
  config = DEFAULT_CONFIG,
  onUpload,
  onRemove,
  className = ''
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const getFileTypeIcon = (fileName: string) => {
    const ext = '.' + fileName.split('.').pop()?.toLowerCase();
    
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
      return <Image className="w-5 h-5 text-blue-500" />;
    }
    if (['.mp4', '.mov', '.avi', '.mkv'].includes(ext)) {
      return <Video className="w-5 h-5 text-purple-500" />;
    }
    if (['.mp3', '.wav', '.m4a', '.aac'].includes(ext)) {
      return <Music className="w-5 h-5 text-green-500" />;
    }
    
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  const getFileThumbnail = (file: File): string | null => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!config.allowedTypes?.includes(ext)) {
      return { valid: false, error: '不支持的文件类型' };
    }
    
    if (config.maxSize && file.size > config.maxSize) {
      return { valid: false, error: '文件大小超过20MB限制' };
    }
    
    return { valid: true };
  };

  const handleFileSelect = (files: FileList) => {
    const validFiles: UploadedFile[] = [];
    
    Array.from(files).forEach((file) => {
      const validation = validateFile(file);
      
      if (!validation.valid) {
        validFiles.push({
          id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
          file,
          progress: 0,
          status: 'error',
          error: validation.error
        });
        return;
      }
      
      const uploadedFile: UploadedFile = {
        id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
        file,
        progress: 0,
        status: 'uploading'
      };
      
      validFiles.push(uploadedFile);
      simulateUpload(uploadedFile);
    });
    
    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const simulateUpload = (uploadedFile: UploadedFile) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === uploadedFile.id 
              ? { ...f, progress: 100, status: 'completed' as const }
              : f
          )
        );
        
        if (onUpload) {
          onUpload([{
            ...uploadedFile,
            progress: 100,
            status: 'completed'
          }]);
        }
      } else {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === uploadedFile.id ? { ...f, progress } : f
          )
        );
      }
    }, 200);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
    
    // 重置文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    if (onRemove) {
      onRemove(fileId);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 拖放上传区域 */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-all duration-200
          ${isDragging 
            ? 'border-indigo-500 bg-indigo-50' 
            : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
          }
        `}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={config.multiple}
          accept={config.allowedTypes?.join(',')}
          onChange={handleInputChange}
          className="hidden"
        />
        
        <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p className="text-sm text-gray-600 mb-1">
          点击选择文件或拖放文件到此处
        </p>
        <p className="text-xs text-gray-400">
          支持文档、图片、视频、音频文件，最大20MB
        </p>
      </div>

      {/* 已上传文件列表 */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((uploadedFile) => {
            const thumbnail = getFileThumbnail(uploadedFile.file);
            
            return (
              <div
                key={uploadedFile.id}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border
                  ${uploadedFile.status === 'error' 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-200 bg-white'
                  }
                `}
              >
                {/* 文件缩略图或图标 */}
                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt={uploadedFile.file.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded">
                    {getFileTypeIcon(uploadedFile.file.name)}
                  </div>
                )}

                {/* 文件信息 */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {uploadedFile.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(uploadedFile.file.size)}
                  </p>
                  
                  {/* 上传进度条 */}
                  {uploadedFile.status === 'uploading' && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>上传中...</span>
                        <span>{uploadedFile.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${uploadedFile.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* 错误信息 */}
                  {uploadedFile.status === 'error' && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="w-3 h-3" />
                      <span>{uploadedFile.error}</span>
                    </div>
                  )}
                </div>

                {/* 删除按钮 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(uploadedFile.id);
                  }}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  aria-label="删除文件"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

FileUpload.displayName = 'FileUpload';

export default FileUpload;