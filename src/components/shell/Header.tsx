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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Salir
                </button>
            </div>
        </header>
    )
}
