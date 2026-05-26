import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AuthGateProvider } from './contexts/AuthGateContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AuthGateProvider>
          <App />
        </AuthGateProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
