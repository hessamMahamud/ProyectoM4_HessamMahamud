import { useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './features/auth/Authenticator.tsx'
import LoginForm from './components/LoginForm.tsx'
import useTasks from './hooks/useTasks'
import TodayPage from './features/today/TodayPage.tsx'
import StatsPage from './features/stats/StatsPage.tsx'
import HabitsPage from './features/habits/HabitsPage.tsx'
import ProfilePage from './features/profile/ProfilePage.tsx'
import Header from './components/shell/Header.tsx'
import DesktopSidebar from './components/shell/DesktopSidebar.tsx'
import BottomNav from './components/shell/BottomNav.tsx'
import Modal from './components/shell/Modal.tsx'
import type { Tab } from './components/shell/types'
import './components/shell/Loading.css'
import './App.css'

const TAB_PATHS: Record<Tab, string> = {
    today: '/task',
    habits: '/habits',
    stats: '/stats',
    profile: '/profile',
};

function getTabFromPath(pathname: string): Tab {
    const tab = (Object.entries(TAB_PATHS) as [Tab, string][]).find(([, path]) => path === pathname)?.[0];
    return tab || 'today';
}

function App() {
    const { user, loading, logout } = useAuth();
    const { tasks, loading: tasksLoading, error: tasksError, toggleCompleted, deleteTask, saveEdit } = useTasks(user?.uid);
    const location = useLocation();
    const navigate = useNavigate();
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [summaryStatus, setSummaryStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [sendingSummary, setSendingSummary] = useState(false);

    const taskStats = {
        total: tasks.length,
        completed: tasks.filter((task) => task.completed).length,
    };

    const sendTaskSummary = async (): Promise<void> => {
        const recipient = user?.email;
        if (!recipient) {
            setSummaryStatus({ type: 'error', message: 'Tu cuenta no tiene un email disponible.' });
            return;
        }

        setSendingSummary(true);
        setSummaryStatus(null);

        try {
            const response = await fetch('/api/send-task-summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipient,
                    tasks: tasks.map((task) => ({
                        title: task.title,
                        description: task.description,
                        completed: task.completed,
                    })),
                }),
            });
            const data = await response.json() as { error?: string };

            if (!response.ok) {
                throw new Error(data.error || 'No se pudo enviar el resumen.');
            }

            setSummaryStatus({ type: 'success', message: 'Resumen enviado ✓' });
            window.setTimeout(() => setSummaryStatus(null), 3000);
        } catch (sendError) {
            setSummaryStatus({
                type: 'error',
                message: sendError instanceof Error ? sendError.message : 'No se pudo enviar el resumen.',
            });
        } finally {
            setSendingSummary(false);
        }
    };

    if (loading) {
        return (
            <div className="auth-page-container">
                <div className="app-loading-card">
                    <div className="loading-card-icon">🌿</div>
                    <p className="loading-card-message">Cargando tu espacio de bienestar...</p>
                </div>
            </div>
        );
    }

    if (!user) return <LoginForm />;

    const userName = user.displayName || user.email?.split('@')[0] || 'Viajero';
    const activeTab = getTabFromPath(location.pathname);
    const handleTabChange = (tab: Tab) => navigate(TAB_PATHS[tab]);
    const closeTaskModal = () => setIsTaskModalOpen(false);

    return (
        <div className="app-shell">
            <DesktopSidebar
                userName={userName}
                userEmail={user.email}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                onOpenModal={() => setIsTaskModalOpen(true)}
                onLogout={() => void logout()}
                onSendSummary={() => void sendTaskSummary()}
                sendingSummary={sendingSummary}
                summaryStatus={summaryStatus}
            />

            <main className="app-content-wrapper">
                <Header userName={userName} onLogout={() => void logout()} />

                <div className="app-view">
                    <Routes>
                        <Route path="/task" element={
                            <TodayPage
                                completed={taskStats.completed}
                                total={taskStats.total}
                                tasks={tasks}
                                tasksLoading={tasksLoading}
                                tasksError={tasksError}
                                toggleCompleted={toggleCompleted}
                                deleteTask={deleteTask}
                                saveEdit={saveEdit}
                                onSendSummary={() => void sendTaskSummary()}
                                sendingSummary={sendingSummary}
                                summaryStatus={summaryStatus}
                            />
                        } />
                        <Route path="/stats" element={
                            <StatsPage
                                completed={taskStats.completed}
                                total={taskStats.total}
                                tasks={tasks.map((task) => ({
                                    title: task.title,
                                    description: task.description,
                                    completed: task.completed,
                                }))}
                                recipient={user.email || ''}
                            />
                        } />
                        <Route path="/habits" element={<HabitsPage />} />
                        <Route path="/profile" element={<ProfilePage user={user} />} />
                        <Route path="*" element={<Navigate to="/task" replace />} />
                    </Routes>
                </div>
            </main>

            <BottomNav
                activeTab={activeTab}
                onTabChange={handleTabChange}
                onOpenModal={() => setIsTaskModalOpen(true)}
            />
            <Modal isOpen={isTaskModalOpen} onClose={closeTaskModal} />
        </div>
    );
}

export default App
