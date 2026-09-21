import { useState } from 'react'
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

export default function TaskList({
    tasks,
    loading,
    error,
    toggleCompleted,
    deleteTask,
    saveEdit,
}: TaskListProps): ReactElement {
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState<string>('');
    const [editDescription, setEditDescription] = useState<string>('');
    const [actionLoading, setActionLoading] = useState<boolean>(false);

    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

    const handleStartEdit = (task: Task): void => {
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
        return (
            <div className="tasks-empty-card">
                <p>Cargando tus tareas con calma...</p>
            </div>
        );
    }

    return (
        <div className="tasks-container">
            <div className="tasks-section-header">
                <h2>
                    Mis <span className="highlight-orange">Tareas</span>
                </h2>
                <span className="tasks-counter-chip">
                    {tasks.filter((t) => t.completed).length} / {tasks.length} listas
                </span>
            </div>

            <div className="task-filters" aria-label="Filtrar tareas">
                {(['all', 'pending', 'completed'] as const).map((filterOption) => (
                    <button
                        key={filterOption}
                        type="button"
                        className={`task-filter-button ${filter === filterOption ? 'active' : ''}`}
                        onClick={() => setFilter(filterOption)}
                    >
                        {filterOption === 'all' ? 'Todas' : filterOption === 'pending' ? 'Pendientes' : 'Completadas'}
                    </button>
                ))}
            </div>

            {error && (
                <p className="task-list-error">
                    {error}
                </p>
            )}

            {tasks.filter((task) => filter === 'all'
                || (filter === 'completed' ? task.completed : !task.completed)).length === 0 ? (
                <div className="tasks-empty-card">
                    <span className="tasks-empty-icon">🌿</span>
                    <p className="tasks-empty-title">
                        Todo al día y en armonía
                    </p>
                    <p>No tienes tareas pendientes. Tómate una pausa o agrega un nuevo propósito.</p>
                </div>
            ) : (
                <ul className="task-list">
                    {tasks.filter((task) => filter === 'all'
                        || (filter === 'completed' ? task.completed : !task.completed)).map((task) => {
                            const isEditing = editingTaskId === task.id;

                            return (
                                <li
                                    key={task.id}
                                    className={`task-card ${task.completed ? 'is-completed' : ''}`}
                                >
                                    {isEditing ? (
                                        <div className="task-edit-form">
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                                placeholder="Título de la tarea"
                                                disabled={actionLoading}
                                            />
                                            <textarea
                                                className="form-textarea"
                                                value={editDescription}
                                                onChange={(e) => setEditDescription(e.target.value)}
                                                placeholder="Descripción"
                                                rows={2}
                                                disabled={actionLoading}
                                            />
                                            <div className="task-edit-actions">
                                                <button
                                                    type="button"
                                                    className="btn-pill-primary task-edit-button"
                                                    onClick={() => void handleSaveEdit(task.id)}
                                                    disabled={actionLoading}
                                                >
                                                    {actionLoading ? 'Guardando...' : 'Guardar'}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-pill-secondary task-edit-button"
                                                    onClick={handleCancelEdit}
                                                    disabled={actionLoading}
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="task-card-content">
                                            <div className="task-main-info">
                                                <div className="custom-checkbox-wrapper">
                                                    <input
                                                        type="checkbox"
                                                        className="custom-checkbox-input"
                                                        checked={task.completed}
                                                        onChange={() => void toggleCompleted(task)}
                                                        aria-label={`Completar tarea: ${task.title}`}
                                                    />
                                                    <div className="custom-checkbox-box">
                                                        <svg
                                                            className="custom-checkbox-check"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="3"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        >
                                                            <polyline points="20 6 9 17 4 12" />
                                                        </svg>
                                                    </div>
                                                </div>

                                                <div className="task-text-group">
                                                    <h4 className={`task-title ${task.completed ? 'completed' : ''}`}>
                                                        {task.title}
                                                    </h4>
                                                    {task.description && (
                                                        <p className={`task-desc ${task.completed ? 'completed' : ''}`}>
                                                            {task.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="task-actions">
                                                <button
                                                    type="button"
                                                    className="btn-icon-action"
                                                    onClick={() => handleStartEdit(task)}
                                                    aria-label="Editar tarea"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-icon-action delete"
                                                    onClick={() => void deleteTask(task.id)}
                                                    aria-label="Eliminar tarea"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                </ul>
            )}
        </div>
    );
}
