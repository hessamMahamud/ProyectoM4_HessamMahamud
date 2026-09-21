import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import {
    collection,
    query,
    where,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc,
} from 'firebase/firestore'
import type { Timestamp } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../features/auth/Authenticator.tsx'
import './TaskList.css'

export interface Task {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    userId: string;
    createdAt: Timestamp | null;
}

export default function TaskList(): ReactElement {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    // Estado para edición en línea
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState<string>('');
    const [editDescription, setEditDescription] = useState<string>('');
    const [actionLoading, setActionLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'tasks'),
            where('userId', '==', user.uid)
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const fetchedTasks: Task[] = snapshot.docs.map((docSnap) => {
                    const data = docSnap.data();
                    return {
                        id: docSnap.id,
                        title: data.title ?? '',
                        description: data.description ?? '',
                        completed: Boolean(data.completed),
                        userId: data.userId ?? '',
                        createdAt: data.createdAt ?? null,
                    };
                });

                // Orden descendente por createdAt
                fetchedTasks.sort((a, b) => {
                    const timeA = a.createdAt?.toMillis() ?? 0;
                    const timeB = b.createdAt?.toMillis() ?? 0;
                    return timeB - timeA;
                });

                setTasks(fetchedTasks);
                setLoading(false);
            },
            (err) => {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('Error al obtener las tareas en tiempo real.');
                }
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user]);

    const handleToggleCompleted = async (task: Task): Promise<void> => {
        try {
            const taskRef = doc(db, 'tasks', task.id);
            await updateDoc(taskRef, {
                completed: !task.completed,
            });
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            }
        }
    };

    const handleDelete = async (taskId: string): Promise<void> => {
        if (!window.confirm('¿Seguro que deseas eliminar esta tarea?')) return;

        try {
            const taskRef = doc(db, 'tasks', taskId);
            await deleteDoc(taskRef);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            }
        }
    };

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
        const trimmedTitle = editTitle.trim();
        if (!trimmedTitle) {
            setError('El título no puede estar vacío.');
            return;
        }

        setActionLoading(true);
        try {
            const taskRef = doc(db, 'tasks', taskId);
            await updateDoc(taskRef, {
                title: trimmedTitle,
                description: editDescription.trim(),
            });
            handleCancelEdit();
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            }
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

            {error && (
                <p className="task-list-error">
                    {error}
                </p>
            )}

            {tasks.length === 0 ? (
                <div className="tasks-empty-card">
                    <span className="tasks-empty-icon">🌿</span>
                    <p className="tasks-empty-title">
                        Todo al día y en armonía
                    </p>
                    <p>No tienes tareas pendientes. Tómate una pausa o agrega un nuevo propósito.</p>
                </div>
            ) : (
                <ul className="task-list">
                    {tasks.map((task) => {
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
                                                    onChange={() => void handleToggleCompleted(task)}
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
                                                onClick={() => void handleDelete(task.id)}
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
