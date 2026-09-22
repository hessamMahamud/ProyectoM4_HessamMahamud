import { BarChart3, Calendar, Plus, Sparkles, User } from 'lucide-react'
import type { Tab } from './types'
import './BottomNav.css'

const NAV_ITEMS = [
    { id: 'today', label: 'Hoy', icon: Calendar },
    { id: 'stats', label: 'Progreso', icon: BarChart3 },
    { id: 'habits', label: 'Bienestar', icon: Sparkles },
    { id: 'profile', label: 'Perfil', icon: User },
] as const

interface BottomNavProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
    onOpenModal: () => void;
}

export default function BottomNav({ activeTab, onTabChange, onOpenModal }: BottomNavProps) {
    return (
        <nav className="bottom-nav" aria-label="Navegación inferior">
            {NAV_ITEMS.slice(0, 2).map(({ id, label, icon: Icon }) => (
                <button key={id} type="button" className={`nav-item-btn ${activeTab === id ? 'active' : ''}`} onClick={() => onTabChange(id)}>
                    <Icon size={22} strokeWidth={2} />
                    <span>{label}</span>
                </button>
            ))}

            <div className="nav-add-btn-wrapper">
                <button type="button" className="nav-add-btn" onClick={onOpenModal} aria-label="Crear nueva tarea">
                    <Plus size={28} strokeWidth={2.5} />
                </button>
            </div>

            {NAV_ITEMS.slice(2).map(({ id, label, icon: Icon }) => (
                <button key={id} type="button" className={`nav-item-btn ${activeTab === id ? 'active' : ''}`} onClick={() => onTabChange(id)}>
                    <Icon size={22} strokeWidth={2} />
                    <span>{label}</span>
                </button>
            ))}
        </nav>
    )
}
