import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@vscode-shell/ui/styles.css';
import { setTheme } from '@vscode-shell/ui';
import './index.css';
import App from './App';
import { applyTitleBarInsets } from './platform';

setTheme('dark');
applyTitleBarInsets();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
