/**
 * @file AI小部件客户端组件
 * @description 封装可插拔式拖拽移动AI系统的客户端组件
 * @module AISmartWidget
 * @author YYC³ <admin@0379.email>
 * @version 1.0.0
 * @created 2024-10-15
 * @updated 2024-10-15
 */
'use client';

import React, { useRef, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { IntelligentAIWidget, ThemeProvider } from '@yyc3/widget-ui';

/**
 * AI智能小部件客户端组件
 * 处理拖拽后端选择和小部件渲染
 */
export const AISmartWidget: React.FC = () => {
  // 检测是否为移动设备
  const isMobileRef = useRef(false);

  useEffect(() => {
    const checkMobile = () => {
      isMobileRef.current = window.innerWidth < 768;
    };
    
    // 初始化检测
    checkMobile();
    
    // 监听窗口大小变化
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // 根据设备类型选择合适的后端
  const Backend = isMobileRef.current ? TouchBackend : HTML5Backend;

  return (
    <DndProvider backend={Backend}>
      <ThemeProvider initialTheme="light">
        <IntelligentAIWidget
          initialPosition={{ x: 20, y: 100 }}
          initialSize={{ width: 350, height: 500 }}
          initialView="chat"
        />
      </ThemeProvider>
    </DndProvider>
  );
};

export default AISmartWidget;