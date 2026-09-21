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
        return <p>Cargando tareas...</p>;
    }

    return (
        <div style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3>Mis Tareas ({tasks.length})</h3>

            {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}

            {tasks.length === 0 ? (
                <p style={{ opacity: 0.7 }}>No tienes tareas creadas aún.</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {tasks.map((task) => {
                        const isEditing = editingTaskId === task.id;

                        return (
                            <li
                                key={task.id}
                                style={{
                                    border: '1px solid var(--border, #444)',
                                    borderRadius: '8px',
                                    padding: '12px 16px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                }}
                            >
                                {isEditing ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <input
                                            type="text"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            placeholder="Título de la tarea"
                                            disabled={actionLoading}
                                        />
                                        <textarea
                                            value={editDescription}
                                            onChange={(e) => setEditDescription(e.target.value)}
                                            placeholder="Descripción"
                                            rows={2}
                                            disabled={actionLoading}
                                            style={{ resize: 'vertical', fontFamily: 'inherit' }}
                                        />
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                type="button"
                                                onClick={() => void handleSaveEdit(task.id)}
                                                disabled={actionLoading}
                                            >
                                                {actionLoading ? 'Guardando...' : 'Guardar'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleCancelEdit}
                                                disabled={actionLoading}
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
                                            <input
                                                type="checkbox"
                                                checked={task.completed}
                                                onChange={() => void handleToggleCompleted(task)}
                                                style={{ marginTop: '4px', cursor: 'pointer' }}
                                                aria-label={`Marcar como completada tarea: ${task.title}`}
                                            />
                                            <div>
                                                <h4
                                                    style={{
                                                        margin: 0,
                                                        textDecoration: task.completed ? 'line-through' : 'none',
                                                        opacity: task.completed ? 0.6 : 1,
                                                    }}
                                                >
                                                    {task.title}
                                                </h4>
                                                {task.description && (
                                                    <p
                                                        style={{
                                                            margin: '4px 0 0',
                                                            fontSize: '0.9rem',
                                                            opacity: task.completed ? 0.5 : 0.8,
                                                            whiteSpace: 'pre-wrap',
                                                        }}
                                                    >
                                                        {task.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button
                                                type="button"
                                                onClick={() => handleStartEdit(task)}
                                                style={{ fontSize: '0.85rem', padding: '4px 8px' }}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => void handleDelete(task.id)}
                                                style={{ fontSize: '0.85rem', padding: '4px 8px', color: '#ff6b6b' }}
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
