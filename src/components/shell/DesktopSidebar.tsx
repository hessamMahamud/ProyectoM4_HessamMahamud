import type { Tab } from './types'
import './DesktopSidebar.css'

interface DesktopSidebarProps {
    userName: string;
    userEmail: string | null;
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
    onOpenModal: () => void;
    onLogout: () => void;
    onSendSummary: () => void;
    sendingSummary: boolean;
    summaryStatus: { type: 'success' | 'error'; message: string } | null;
}

export default function DesktopSidebar({
    userName,
    userEmail,
    activeTab,
    onTabChange,
    onOpenModal,
    onLogout,
    onSendSummary,
    sendingSummary,
    summaryStatus,
}: DesktopSidebarProps) {
    return (
        <aside className="desktop-sidebar">
            <div className="sidebar-top">
                <div className="sidebar-brand">
                    <h2>
                        Task<span className="highlight-orange">Coach</span>
                    </h2>
                    <p>Productividad consciente</p>
                </div>

                <nav className="sidebar-nav">
                    <button type="button" className={`sidebar-nav-item ${activeTab === 'today' ? 'active' : ''}`} onClick={() => onTabChange('today')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                        Hoy y Tareas
                    </button>
                    <button type="button" className={`sidebar-nav-item ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => onTabChange('stats')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
                        Progreso
                    </button>
                    <button type="button" className={`sidebar-nav-item ${activeTab === 'habits' ? 'active' : ''}`} onClick={() => onTabChange('habits')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>
                        Hábitos & Bienestar
                    </button>
                    <button type="button" className={`sidebar-nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => onTabChange('profile')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        Perfil
                    </button>

                    <button type="button" className="btn-pill-primary sidebar-cta-btn" onClick={onOpenModal}>+ Nueva tarea</button>
                    <button type="button" className="summary-email-button" onClick={onSendSummary} disabled={sendingSummary}>
                        {sendingSummary ? 'Enviando...' : 'Enviar resumen por email'}
                    </button>
                    {summaryStatus && <p className={`summary-email-status ${summaryStatus.type}`} role="status">{summaryStatus.message}</p>}
                </nav>
            </div>

            <div className="sidebar-bottom">
                <div className="sidebar-user-info">
                    <div className="user-avatar-btn">{userName.charAt(0).toUpperCase()}</div>
                    <div className="sidebar-user-details">
                        <span className="sidebar-user-name">{userName}</span>
                        <span className="sidebar-user-role">{userEmail}</span>
                    </div>
                </div>

                <button type="button" className="logout-icon-btn sidebar-logout-btn" onClick={onLogout}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                    Cerrar sesión
                </button>
            </div>
        </aside>
    )
}
