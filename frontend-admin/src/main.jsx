import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import App from './app/App.jsx';
import { AuthProvider } from './features/auth/hooks/useAuth.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);