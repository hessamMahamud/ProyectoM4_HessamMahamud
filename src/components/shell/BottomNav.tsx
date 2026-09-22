import type { Tab } from './types'
import './BottomNav.css'

interface BottomNavProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
    onOpenModal: () => void;
}

export default function BottomNav({ activeTab, onTabChange, onOpenModal }: BottomNavProps) {
    return (
        <nav className="bottom-nav" aria-label="Navegación inferior">
            <button type="button" className={`nav-item-btn ${activeTab === 'today' ? 'active' : ''}`} onClick={() => onTabChange('today')}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                <span>Hoy</span>
            </button>
            <button type="button" className={`nav-item-btn ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => onTabChange('stats')}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
                <span>Progreso</span>
            </button>

            <div className="nav-add-btn-wrapper">
                <button type="button" className="nav-add-btn" onClick={onOpenModal} aria-label="Crear nueva tarea">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                </button>
            </div>

            <button type="button" className={`nav-item-btn ${activeTab === 'habits' ? 'active' : ''}`} onClick={() => onTabChange('habits')}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>
                <span>Bienestar</span>
            </button>
            <button type="button" className={`nav-item-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => onTabChange('profile')}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                <span>Perfil</span>
            </button>
        </nav>
    )
}
