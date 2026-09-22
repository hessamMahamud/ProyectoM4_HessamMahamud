import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Authenticator } from './features/auth/Authenticator.tsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <Authenticator>
                <App />
            </Authenticator>
        </BrowserRouter>
    </StrictMode>,
)
