import { useState } from 'react'
import './StatsPage.css'

interface TaskSummary {
    title: string;
    description: string;
    completed: boolean;
}

interface StatsPageProps {
    completed: number;
    total: number;
    tasks: TaskSummary[];
    recipient: string;
}

export default function StatsPage({ completed, total, tasks, recipient }: StatsPageProps) {
    const [sending, setSending] = useState(false);
    const [emailStatus, setEmailStatus] = useState('');
    const pending = Math.max(total - completed, 0);
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    const radius = 48;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    const handleSendSummary = async () => {
        setSending(true);
        setEmailStatus('');

        try {
            const result = await fetch('/api/send-task-summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipient, tasks }),
            });
            const data = await result.json() as { message?: string; error?: string };

            if (!result.ok) {
                throw new Error(data.error || 'No se pudo enviar el resumen.');
            }

            setEmailStatus(data.message || 'Resumen enviado correctamente.');
        } catch (error) {
            setEmailStatus(error instanceof Error ? error.message : 'No se pudo enviar el resumen.');
        } finally {
            setSending(false);
        }
    };

    return (
        <section className="feature-page stats-page">
            <header className="feature-page-header">
                <div>
                    <span className="feature-eyebrow">Resumen personal</span>
                    <h2>Tu progreso</h2>
                    <p>Una mirada clara a todo lo que has avanzado.</p>
                </div>
                <div className="stats-header-actions">
                    <span className="feature-date-chip">Hoy</span>
                    <button
                        type="button"
                        className="stats-email-button"
                        onClick={() => void handleSendSummary()}
                        disabled={sending}
                    >
                        {sending ? 'Enviando...' : 'Enviar resumen'}
                    </button>
                </div>
            </header>

            {emailStatus && <p className="stats-email-status" role="status">{emailStatus}</p>}

            <div className="stats-summary-grid">
                <article className="stats-summary-card stats-summary-card-highlight">
                    <span className="stats-summary-label">Completadas</span>
                    <strong>{completed}</strong>
                    <span className="stats-summary-note">tareas terminadas</span>
                </article>
                <article className="stats-summary-card">
                    <span className="stats-summary-label">Pendientes</span>
                    <strong>{pending}</strong>
                    <span className="stats-summary-note">por enfocar</span>
                </article>
                <article className="stats-summary-card">
                    <span className="stats-summary-label">Total</span>
                    <strong>{total}</strong>
                    <span className="stats-summary-note">metas registradas</span>
                </article>
            </div>

            <div className="stats-visual-grid">
                <article className="feature-card stats-ring-card">
                    <div className="feature-card-heading">
                        <div>
                            <span className="feature-eyebrow">Rendimiento</span>
                            <h3>Avance total</h3>
                        </div>
                        <span className="stats-trend">{percent >= 50 ? 'Buen ritmo' : 'En marcha'}</span>
                    </div>
                    <div className="stats-ring-wrapper">
                        <svg className="stats-ring" viewBox="0 0 120 120" aria-label={`${percent}% de tareas completadas`}>
                            <circle className="stats-ring-track" cx="60" cy="60" r={radius} />
                            <circle
                                className="stats-ring-progress"
                                cx="60"
                                cy="60"
                                r={radius}
                                style={{
                                    strokeDasharray: circumference,
                                    strokeDashoffset,
                                }}
                            />
                        </svg>
                        <div className="stats-ring-label">
                            <strong>{percent}%</strong>
                            <span>completado</span>
                        </div>
                    </div>
                </article>

                <article className="feature-card stats-bars-card">
                    <div className="feature-card-heading">
                        <div>
                            <span className="feature-eyebrow">Distribución</span>
                            <h3>Estado de tus tareas</h3>
                        </div>
                    </div>
                    <div className="stats-bars" role="img" aria-label="Gráfica de tareas completadas y pendientes">
                        <div className="stats-bar-group">
                            <div className="stats-bar-track">
                                <div className="stats-bar-fill stats-bar-fill-completed" style={{ height: `${Math.max(percent, 4)}%` }} />
                            </div>
                            <strong>{completed}</strong>
                            <span>Hechas</span>
                        </div>
                        <div className="stats-bar-group">
                            <div className="stats-bar-track">
                                <div className="stats-bar-fill stats-bar-fill-pending" style={{ height: `${Math.max(total > 0 ? (pending / total) * 100 : 0, 4)}%` }} />
                            </div>
                            <strong>{pending}</strong>
                            <span>Pendientes</span>
                        </div>
                        <div className="stats-bar-group">
                            <div className="stats-bar-track">
                                <div className="stats-bar-fill stats-bar-fill-total" style={{ height: total > 0 ? '100%' : '4%' }} />
                            </div>
                            <strong>{total}</strong>
                            <span>Total</span>
                        </div>
                    </div>
                </article>
            </div>

            <article className="feature-card stats-focus-card">
                <div>
                    <span className="feature-eyebrow">Siguiente paso</span>
                    <h3>{pending > 0 ? 'Concentra tu energía en una meta pendiente' : 'Has cerrado todas tus metas'}</h3>
                    <p>{pending > 0 ? 'Completar una tarea pequeña también cuenta como progreso.' : 'Disfruta el resultado y prepara tu próximo propósito.'}</p>
                </div>
                <span className="stats-focus-icon">✦</span>
            </article>
        </section>
    );
}
