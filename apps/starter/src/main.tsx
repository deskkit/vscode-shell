import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@vscode-shell/ui/styles.css';
import { setTheme } from '@vscode-shell/ui';
import './index.css';
import App from './App';

setTheme('dark');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
