import TaskList from '../../components/TaskList.tsx'
import './TodayPage.css'

interface TodayPageProps {
    completed: number;
    total: number;
}

export default function TodayPage({ completed, total }: TodayPageProps) {
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

    return (
        <div className="today-page">
            <section className="progress-card-dark" aria-label="Progreso del día">
                <div className="progress-card-info">
                    <span className="progress-badge">🌿 Enfoque Diario</span>
                    <h2 className="progress-title">Progreso de hoy</h2>
                    <p className="progress-subtitle">
                        <strong>{completed}</strong> de <strong>{total}</strong> tareas completadas
                    </p>
                    <p className="progress-coach-tip">{getCoachMessage()}</p>
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

            <TaskList />
        </div>
    );
}
