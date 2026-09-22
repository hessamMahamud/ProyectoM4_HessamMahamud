import { LogOut } from 'lucide-react'
import './Header.css'

interface HeaderProps {
    userName: string;
    onLogout: () => void;
}

export default function Header({ userName, onLogout }: HeaderProps) {
    return (
        <header className="app-header">
            <div className="header-greeting">
                <h1>
                    Hola, <span className="highlight-orange">{userName}</span> ✨
                </h1>
                <p>Encuentra tu equilibrio y productividad hoy</p>
            </div>

            <div className="header-actions">
                <button
                    type="button"
                    className="logout-icon-btn"
                    onClick={onLogout}
                    title="Cerrar sesión"
                    aria-label="Cerrar sesión"
                >
                    <LogOut size={16} strokeWidth={2} />
                    Salir
                </button>
            </div>
        </header>
    )
}
