import { Navigate, Route, Routes } from 'react-router-dom'
import type { User } from 'firebase/auth'
import HabitsPage from '../features/habits/HabitsPage.tsx'
import ProfilePage from '../features/profile/ProfilePage.tsx'
import StatsPage from '../features/stats/StatsPage.tsx'
import TodayPage from '../features/today/TodayPage.tsx'
import type { Task } from '../hooks/useTasks'

interface AppRoutesProps {
    user: User;
    tasks: Task[];
    tasksLoading: boolean;
    tasksError: string;
    completedTasks: number;
    onToggleCompleted: (task: Task) => Promise<void>;
    onDeleteTask: (taskId: string) => Promise<void>;
    onSaveEdit: (taskId: string, title: string, description: string) => Promise<boolean>;
    onSendSummary: () => void;
    sendingSummary: boolean;
    summaryStatus: { type: 'success' | 'error'; message: string } | null;
}

export default function AppRoutes({
    user,
    tasks,
    tasksLoading,
    tasksError,
    completedTasks,
    onToggleCompleted,
    onDeleteTask,
    onSaveEdit,
    onSendSummary,
    sendingSummary,
    summaryStatus,
}: AppRoutesProps) {
    return (
        <Routes>
            <Route path="/task" element={
                <TodayPage
                    completed={completedTasks}
                    total={tasks.length}
                    tasks={tasks}
                    tasksLoading={tasksLoading}
                    tasksError={tasksError}
                    toggleCompleted={onToggleCompleted}
                    deleteTask={onDeleteTask}
                    saveEdit={onSaveEdit}
                    onSendSummary={onSendSummary}
                    sendingSummary={sendingSummary}
                    summaryStatus={summaryStatus}
                />
            } />
            <Route path="/stats" element={
                <StatsPage
                    completed={completedTasks}
                    total={tasks.length}
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
    );
}
