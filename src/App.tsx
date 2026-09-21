import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from './services/firebase'
import { useAuth } from './features/auth/Authenticator.tsx'
import LoginForm from './components/LoginForm.tsx'
import TaskForm from './components/TaskForm.tsx'
import TodayPage from './features/today/TodayPage.tsx'
import StatsPage from './features/stats/StatsPage.tsx'
import HabitsPage from './features/habits/HabitsPage.tsx'
import ProfilePage from './features/profile/ProfilePage.tsx'
import './App.css'

function App() {
    const { user, loading, logout } = useAuth();
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'today' | 'stats' | 'habits' | 'profile'>('today');
    const [taskStats, setTaskStats] = useState({ total: 0, completed: 0 });

    // Escuchar estadísticas de tareas del usuario para la tarjeta de progreso
    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'tasks'),
            where('userId', '==', user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const total = snapshot.docs.length;
            const completed = snapshot.docs.filter((doc) => Boolean(doc.data().completed)).length;
            setTaskStats({ total, completed });
        });

        return () => unsubscribe();
    }, [user]);

    if (loading) {
        return (
            <div className="auth-page-container">
                <div className="app-loading-card">
                    <div className="loading-card-icon">🌿</div>
                    <p className="loading-card-message">
                        Cargando tu espacio de bienestar...
                    </p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <LoginForm />;
    }

    const userName = user.displayName || user.email?.split('@')[0] || 'Viajero';

    return (
        <div className="app-shell">
            {/* Sidebar para pantallas de escritorio (>= 768px) */}
            <aside className="desktop-sidebar">
                <div className="sidebar-top">
                    <div className="sidebar-brand">
                        <h2>
                            Task<span className="highlight-orange">Coach</span>
                        </h2>
                        <p>Productividad consciente</p>
                    </div>

                    <nav className="sidebar-nav">
                        <button
                            type="button"
                            className={`sidebar-nav-item ${activeTab === 'today' ? 'active' : ''}`}
                            onClick={() => setActiveTab('today')}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            Hoy y Tareas
                        </button>

                        <button
                            type="button"
                            className={`sidebar-nav-item ${activeTab === 'stats' ? 'active' : ''}`}
                            onClick={() => setActiveTab('stats')}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="20" x2="18" y2="10" />
                                <line x1="12" y1="20" x2="12" y2="4" />
                                <line x1="6" y1="20" x2="6" y2="14" />
                            </svg>
                            Progreso
                        </button>

                        <button
                            type="button"
                            className={`sidebar-nav-item ${activeTab === 'habits' ? 'active' : ''}`}
                            onClick={() => setActiveTab('habits')}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                            </svg>
                            Hábitos & Bienestar
                        </button>

                        <button
                            type="button"
                            className={`sidebar-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            Perfil
                        </button>

                        <button
                            type="button"
                            className="btn-pill-primary sidebar-cta-btn"
                            onClick={() => setIsTaskModalOpen(true)}
                        >
                            + Nueva tarea
                        </button>
                    </nav>
                </div>

                <div className="sidebar-bottom">
                    <div className="sidebar-user-info">
                        <div className="user-avatar-btn">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="sidebar-user-details">
                            <span className="sidebar-user-name">{userName}</span>
                            <span className="sidebar-user-role">{user.email}</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="logout-icon-btn sidebar-logout-btn"
                        onClick={() => void logout()}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Cerrar sesión
                    </button>
                </div>
            </aside>

            {/* Contenedor central (Mobile-first por defecto) */}
            <main className="app-content-wrapper">
                {/* Header superior */}
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
                            onClick={() => void logout()}
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

                <div className="app-view">
                    {activeTab === 'today' && (
                        <TodayPage completed={taskStats.completed} total={taskStats.total} />
                    )}
                    {activeTab === 'stats' && (
                        <StatsPage completed={taskStats.completed} total={taskStats.total} />
                    )}
                    {activeTab === 'habits' && <HabitsPage />}
                    {activeTab === 'profile' && (
                        <ProfilePage user={user} onLogout={() => void logout()} />
                    )}
                </div>
            </main>

            {/* Barra de navegación fija inferior (Solo Mobile) */}
            <nav className="bottom-nav" aria-label="Navegación inferior">
                <button
                    type="button"
                    className={`nav-item-btn ${activeTab === 'today' ? 'active' : ''}`}
                    onClick={() => setActiveTab('today')}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>Hoy</span>
                </button>

                <button
                    type="button"
                    className={`nav-item-btn ${activeTab === 'stats' ? 'active' : ''}`}
                    onClick={() => setActiveTab('stats')}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="20" x2="18" y2="10" />
                        <line x1="12" y1="20" x2="12" y2="4" />
                        <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                    <span>Progreso</span>
                </button>

                {/* Botón Central Elevado Naranja para abrir TaskForm */}
                <div className="nav-add-btn-wrapper">
                    <button
                        type="button"
                        className="nav-add-btn"
                        onClick={() => setIsTaskModalOpen(true)}
                        aria-label="Crear nueva tarea"
                    >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </button>
                </div>

                <button
                    type="button"
                    className={`nav-item-btn ${activeTab === 'habits' ? 'active' : ''}`}
                    onClick={() => setActiveTab('habits')}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    <span>Bienestar</span>
                </button>

                <button
                    type="button"
                    className={`nav-item-btn ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span>Perfil</span>
                </button>
            </nav>

            {/* Modal / Sheet para crear una nueva tarea */}
            {isTaskModalOpen && (
                <div
                    className="modal-overlay"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setIsTaskModalOpen(false);
                        }
                    }}
                >
                    <div className="modal-sheet">
                        <div className="modal-header">
                            <h3>
                                Nueva <span className="highlight-orange">Tarea</span>
                            </h3>
                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={() => setIsTaskModalOpen(false)}
                                aria-label="Cerrar modal"
                            >
                                ✕
                            </button>
                        </div>
                        <TaskForm onSuccess={() => setIsTaskModalOpen(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default App
