import { useState } from 'react'
import { Check } from 'lucide-react'
import type { ReactElement } from 'react'
import type { Task } from '../hooks/useTasks'
import './TaskList.css'

interface TaskListProps {
    tasks: Task[];
    loading: boolean;
    error: string;
    toggleCompleted: (task: Task) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
    saveEdit: (taskId: string, title: string, description: string) => Promise<boolean>;
}

const PENDING_TONES = ['tone-cyan', 'tone-lilac'] as const;

export const getPendingTone = (taskId: string): typeof PENDING_TONES[number] => {
    const characterSum = Array.from(taskId).reduce(
        (sum, character) => sum + character.charCodeAt(0),
        0,
    );

    return PENDING_TONES[characterSum % PENDING_TONES.length];
};

const formatTaskTime = (task: Task): string => {
    if (!task.createdAt) return '--:--';

    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
    }).format(task.createdAt.toDate());
};

export default function TaskList({
    tasks,
    loading,
    error,
    toggleCompleted,
    deleteTask,
    saveEdit,
}: TaskListProps): ReactElement {
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState<string>('');
    const [editDescription, setEditDescription] = useState<string>('');
    const [actionLoading, setActionLoading] = useState<boolean>(false);
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

    const handleStartEdit = (task: Task): void => {
        setOpenMenuId(null);
        setEditingTaskId(task.id);
        setEditTitle(task.title);
        setEditDescription(task.description);
    };

    const handleCancelEdit = (): void => {
        setEditingTaskId(null);
        setEditTitle('');
        setEditDescription('');
    };

    const handleSaveEdit = async (taskId: string): Promise<void> => {
        setActionLoading(true);
        try {
            const saved = await saveEdit(taskId, editTitle, editDescription);
            if (saved) handleCancelEdit();
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return <div className="tasks-empty-card"><p>Cargando tus tareas con calma...</p></div>;
    }

    const visibleTasks = tasks.filter((task) => filter === 'all'
        || (filter === 'completed' ? task.completed : !task.completed));

    return (
        <section className="tasks-container" aria-labelledby="tasks-heading">
            <div className="tasks-section-header">
                <div>
                    <span className="tasks-section-kicker">Tu recorrido</span>
                    <h2 id="tasks-heading">Mis <span className="highlight-orange">Tareas</span></h2>
                </div>
                <span className="tasks-counter-chip">
                    {tasks.filter((task) => task.completed).length} / {tasks.length} listas
                </span>
            </div>

            <div className="task-filters" aria-label="Filtrar tareas">
                {(['all', 'pending', 'completed'] as const).map((filterOption) => (
                    <button key={filterOption} type="button" className={`task-filter-button ${filter === filterOption ? 'active' : ''}`} onClick={() => setFilter(filterOption)}>
                        {filterOption === 'all' ? 'Todas' : filterOption === 'pending' ? 'Pendientes' : 'Completadas'}
                    </button>
                ))}
            </div>

            {error && <p className="task-list-error">{error}</p>}

            {visibleTasks.length === 0 ? (
                <div className="tasks-empty-card">
                    <span className="tasks-empty-icon">✓</span>
                    <p className="tasks-empty-title">Todo al día y en armonía</p>
                    <p>No tienes tareas pendientes. Tómate una pausa o agrega un nuevo propósito.</p>
                </div>
            ) : (
                <ul className="task-list">
                    {visibleTasks.map((task) => {
                        const isEditing = editingTaskId === task.id;
                        const pendingTone = getPendingTone(task.id);

                        return (
                            <li key={task.id} className={`task-timeline-item ${task.completed ? 'is-completed' : pendingTone}`}>
                                <div className="task-time" aria-label={`Creada a las ${formatTaskTime(task)}`}>{formatTaskTime(task)}</div>
                                <div className="task-timeline-track" aria-hidden="true">
                                    <span className="task-node">
                                        <Check size={13} strokeWidth={2.3} />
                                    </span>
                                </div>

                                <div className="task-card">
                                    {isEditing ? (
                                        <div className="task-edit-form">
                                            <input type="text" className="form-input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Título de la tarea" disabled={actionLoading} />
                                            <textarea className="form-textarea" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Descripción" rows={2} disabled={actionLoading} />
                                            <div className="task-edit-actions">
                                                <button type="button" className="btn-pill-primary task-edit-button" onClick={() => void handleSaveEdit(task.id)} disabled={actionLoading}>{actionLoading ? 'Guardando...' : 'Guardar'}</button>
                                                <button type="button" className="btn-pill-secondary task-edit-button" onClick={handleCancelEdit} disabled={actionLoading}>Cancelar</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="task-card-content">
                                            <div className="task-main-info">
                                                <div className="custom-checkbox-wrapper">
                                                    <input type="checkbox" className="custom-checkbox-input" checked={task.completed} onChange={() => void toggleCompleted(task)} aria-label={`Completar tarea: ${task.title}`} />
                                                    <div className="custom-checkbox-box">
                                                        <Check className="custom-checkbox-check" size={14} strokeWidth={3} />
                                                    </div>
                                                </div>
                                                <div className="task-text-group">
                                                    <span className="task-status">{task.completed ? 'Completada' : 'Pendiente'}</span>
                                                    <h4 className={`task-title ${task.completed ? 'completed' : ''}`}>{task.title}</h4>
                                                    {task.description && <p className={`task-desc ${task.completed ? 'completed' : ''}`}>{task.description}</p>}
                                                </div>
                                            </div>

                                            <div className="task-actions-wrap">
                                                <button type="button" className="task-menu-trigger" onClick={() => setOpenMenuId(openMenuId === task.id ? null : task.id)} aria-label={`Abrir acciones de ${task.title}`} aria-expanded={openMenuId === task.id}>
                                                    <span /><span /><span />
                                                </button>
                                                <div className={`task-actions-menu ${openMenuId === task.id ? 'is-open' : ''}`}>
                                                    <button type="button" className="btn-icon-action" onClick={() => handleStartEdit(task)} aria-label="Editar tarea">Editar</button>
                                                    <button type="button" className="btn-icon-action delete" onClick={() => { setOpenMenuId(null); void deleteTask(task.id); }} aria-label="Eliminar tarea">Eliminar</button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
