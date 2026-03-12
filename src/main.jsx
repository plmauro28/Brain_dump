import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'

window.onerror = function(msg, url, line, col, error) {
  document.body.innerHTML = `<div style="padding:20px;color:red;font-family:monospace">
    <h3>Global Crash</h3>
    <p>${msg}</p>
    <pre>${error ? error.stack : ''}</pre>
  </div>`;
};

window.addEventListener("unhandledrejection", function(event) {
  document.body.innerHTML = `<div style="padding:20px;color:red;font-family:monospace">
    <h3>Unhandled Promise Rejection</h3>
    <p>${event.reason}</p>
    <pre>${event.reason?.stack}</pre>
  </div>`;
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
