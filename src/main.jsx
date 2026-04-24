import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import React from "react";

import App from './App.jsx'
import GlobalSnackbar from './Components/Snackbar/Snackbar.jsx'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GlobalSnackbar>
      <App />
    </GlobalSnackbar>
  </React.StrictMode>
)
