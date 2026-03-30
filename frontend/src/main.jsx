import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import App from './App.jsx'
import { ToastProvider } from "./components/ToastProvider";
import { ThemeProvider } from "./contexts/ThemeContext";
import { I18nProvider } from "./contexts/I18nContext";
import "./styles/common.css";
import "./styles/ui.css";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <I18nProvider>
        <ThemeProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ThemeProvider>
      </I18nProvider>
    </ToastProvider>
  </StrictMode>,
)
