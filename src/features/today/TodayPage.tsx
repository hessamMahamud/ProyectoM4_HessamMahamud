import { Calendar } from 'lucide-react'
import TaskList from '../../components/TaskList.tsx'
import type { Task } from '../../hooks/useTasks'
import './TodayPage.css'

interface TodayPageProps {
    completed: number;
    total: number;
    tasks: Task[];
    tasksLoading: boolean;
    tasksError: string;
    toggleCompleted: (task: Task) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
    saveEdit: (taskId: string, title: string, description: string) => Promise<boolean>;
    onSendSummary: () => void;
    sendingSummary: boolean;
    summaryStatus: { type: 'success' | 'error'; message: string } | null;
}

export default function TodayPage({
    completed,
    total,
    tasks,
    tasksLoading,
    tasksError,
    toggleCompleted,
    deleteTask,
    saveEdit,
    onSendSummary,
    sendingSummary,
    summaryStatus,
}: TodayPageProps) {
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    const radius = 34;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    const getCoachMessage = () => {
        if (total === 0) return 'Define tu primera meta del día con tranquilidad.';
        if (percent === 100) return '¡Increíble! Has completado todas tus metas de hoy. ✨';
        if (percent >= 50) return '¡Gran ritmo! Estás a más de la mitad del camino. 🌿';
        return 'Paso a paso, cada avance suma a tu bienestar diario. ⚡';
    };

    const todayLabel = new Intl.DateTimeFormat('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    }).format(new Date());

    return (
        <div className="today-page">
            <header className="today-heading">
                <div>
                    <span className="today-eyebrow">Tu agenda de hoy</span>
                    <h2>Hoy y <span className="highlight-orange">Tareas</span></h2>
                </div>
                <div className="date-selector" aria-label={`Fecha de hoy: ${todayLabel}`}>
                    <Calendar size={18} strokeWidth={1.8} aria-hidden="true" />
                    <span>{todayLabel}</span>
                </div>
            </header>
            <section className="progress-card-dark" aria-label="Progreso del día">
                <div className="progress-card-info">
                    <span className="progress-badge">🌿 Enfoque Diario</span>
                    <h2 className="progress-title">Progreso de hoy</h2>
                    <p className="progress-subtitle">
                        <strong>{completed}</strong> de <strong>{total}</strong> tareas completadas
                    </p>
                    <p className="progress-coach-tip">{getCoachMessage()}</p>
                    <button
                        type="button"
                        className="summary-email-button"
                        onClick={onSendSummary}
                        disabled={sendingSummary}
                    >
                        {sendingSummary ? 'Enviando...' : 'Enviar resumen por email'}
                    </button>
                    {summaryStatus && (
                        <p className={`summary-email-status ${summaryStatus.type}`} role="status">
                            {summaryStatus.message}
                        </p>
                    )}
                </div>

                <div className="progress-meter-container">
                    <svg className="progress-svg" viewBox="0 0 86 86">
                        <circle className="progress-circle-bg" cx="43" cy="43" r={radius} />
                        <circle
                            className="progress-circle-fill"
                            cx="43"
                            cy="43"
                            r={radius}
                            style={{
                                strokeDasharray: circumference,
                                strokeDashoffset,
                            }}
                        />
                    </svg>
                    <div className="progress-percentage-label">
                        <span className="progress-percent-number">{percent}%</span>
                        <span className="progress-percent-text">hecho</span>
                    </div>
                </div>
            </section>

            <TaskList
                tasks={tasks}
                loading={tasksLoading}
                error={tasksError}
                toggleCompleted={toggleCompleted}
                deleteTask={deleteTask}
                saveEdit={saveEdit}
            />
        </div>
    );
}
