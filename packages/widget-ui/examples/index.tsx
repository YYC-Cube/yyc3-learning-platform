import React from 'react';
import ReactDOM from 'react-dom/client';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { IntelligentAIWidget } from '../src/components/IntelligentAIWidget';

const App: React.FC = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <ThemeProvider>
        <div style={{ height: '100vh', width: '100vw', background: '#f0f0f0' }}>
          <h1 style={{ textAlign: 'center', padding: '20px' }}>YYC³ 可插拔式拖拽移动 AI 系统示例</h1>
          <IntelligentAIWidget />
        </div>
      </ThemeProvider>
    </DndProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);