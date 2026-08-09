import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { initVitals } from './utils/vitals'
import './index.css'

// Before render, so the observers are watching by the time the first paint and the first
// layout shifts happen. The observers use buffered:true as a backstop, but registering
// early keeps the custom marks honest relative to navigation start.
initVitals()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
