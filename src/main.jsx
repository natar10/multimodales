import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  // StrictMode disabled for development — causes double-effect on video init
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
)
