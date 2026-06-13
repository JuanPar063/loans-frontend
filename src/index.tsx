import React from 'react';
import ReactDOM from 'react-dom/client';
import { SnackbarProvider } from 'notistack';
import App from './App';
import ErrorBoundary from './components/common/ErrorBoundary';
import { AppThemeProvider } from './theme/ColorModeContext';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <AppThemeProvider>
      <ErrorBoundary>
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          autoHideDuration={4000}
        >
          <App />
        </SnackbarProvider>
      </ErrorBoundary>
    </AppThemeProvider>
  </React.StrictMode>,
);
