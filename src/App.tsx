import { useState } from 'react'
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

function App() {
    const { user, loading, logout } = useAuth();
    const { tasks, loading: tasksLoading, error: tasksError, toggleCompleted, deleteTask, saveEdit } = useTasks(user?.uid);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('today');
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
    const closeTaskModal = () => setIsTaskModalOpen(false);

    return (
        <div className="app-shell">
            <DesktopSidebar
                userName={userName}
                userEmail={user.email}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onOpenModal={() => setIsTaskModalOpen(true)}
                onLogout={() => void logout()}
                onSendSummary={() => void sendTaskSummary()}
                sendingSummary={sendingSummary}
                summaryStatus={summaryStatus}
            />

            <main className="app-content-wrapper">
                <Header userName={userName} onLogout={() => void logout()} />

                <div className="app-view">
                    {activeTab === 'today' && (
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
                    )}
                    {activeTab === 'stats' && (
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
                    )}
                    {activeTab === 'habits' && <HabitsPage />}
                    {activeTab === 'profile' && <ProfilePage user={user} />}
                </div>
            </main>

            <BottomNav
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onOpenModal={() => setIsTaskModalOpen(true)}
            />
            <Modal isOpen={isTaskModalOpen} onClose={closeTaskModal} />
        </div>
    );
}

export default App
