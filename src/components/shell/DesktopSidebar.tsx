import { BarChart3, Calendar, LogOut, Sparkles, User } from 'lucide-react'
import type { Tab } from './types'
import './DesktopSidebar.css'

const NAV_ITEMS = [
    { id: 'today', label: 'Hoy y Tareas', icon: Calendar },
    { id: 'stats', label: 'Progreso', icon: BarChart3 },
    { id: 'habits', label: 'Hábitos & Bienestar', icon: Sparkles },
    { id: 'profile', label: 'Perfil', icon: User },
] as const

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
                    {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                        <button key={id} type="button" className={`sidebar-nav-item ${activeTab === id ? 'active' : ''}`} onClick={() => onTabChange(id)}>
                            <Icon width={20} height={20} strokeWidth={2} />
                            {label}
                        </button>
                    ))}

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
                    <LogOut size={16} strokeWidth={2} />
                    Cerrar sesión
                </button>
            </div>
        </aside>
    )
}
