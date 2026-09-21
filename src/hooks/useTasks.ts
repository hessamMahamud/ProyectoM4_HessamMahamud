import { useEffect, useState } from 'react'
import type { Timestamp } from 'firebase/firestore'
import {
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    updateDoc,
    where,
} from 'firebase/firestore'
import { db } from '../services/firebase'

export interface Task {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    userId: string;
    createdAt: Timestamp | null;
}

export interface UseTasksResult {
    tasks: Task[];
    loading: boolean;
    error: string;
    toggleCompleted: (task: Task) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
    saveEdit: (taskId: string, title: string, description: string) => Promise<boolean>;
}

export default function useTasks(userId: string | undefined): UseTasksResult {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (!userId) {
            setTasks([]);
            setLoading(false);
            setError('');
            return;
        }

        setLoading(true);
        setError('');

        const tasksQuery = query(
            collection(db, 'tasks'),
            where('userId', '==', userId),
        );

        const unsubscribe = onSnapshot(
            tasksQuery,
            (snapshot) => {
                const fetchedTasks: Task[] = snapshot.docs.map((taskSnapshot) => {
                    const data = taskSnapshot.data();
                    return {
                        id: taskSnapshot.id,
                        title: data.title ?? '',
                        description: data.description ?? '',
                        completed: Boolean(data.completed),
                        userId: data.userId ?? '',
                        createdAt: data.createdAt ?? null,
                    };
                });

                fetchedTasks.sort((firstTask, secondTask) => {
                    const firstTime = firstTask.createdAt?.toMillis() ?? 0;
                    const secondTime = secondTask.createdAt?.toMillis() ?? 0;
                    return secondTime - firstTime;
                });

                setTasks(fetchedTasks);
                setLoading(false);
            },
            (snapshotError) => {
                setError(snapshotError instanceof Error
                    ? snapshotError.message
                    : 'Error al obtener las tareas en tiempo real.');
                setLoading(false);
            },
        );

        return () => unsubscribe();
    }, [userId]);

    const toggleCompleted = async (task: Task): Promise<void> => {
        try {
            await updateDoc(doc(db, 'tasks', task.id), {
                completed: !task.completed,
            });
        } catch (actionError) {
            setError(actionError instanceof Error
                ? actionError.message
                : 'No se pudo actualizar la tarea.');
        }
    };

    const deleteTask = async (taskId: string): Promise<void> => {
        if (!window.confirm('¿Seguro que deseas eliminar esta tarea?')) return;

        try {
            await deleteDoc(doc(db, 'tasks', taskId));
        } catch (actionError) {
            setError(actionError instanceof Error
                ? actionError.message
                : 'No se pudo eliminar la tarea.');
        }
    };

    const saveEdit = async (
        taskId: string,
        title: string,
        description: string,
    ): Promise<boolean> => {
        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            setError('El título no puede estar vacío.');
            return false;
        }

        try {
            await updateDoc(doc(db, 'tasks', taskId), {
                title: trimmedTitle,
                description: description.trim(),
            });
            return true;
        } catch (actionError) {
            setError(actionError instanceof Error
                ? actionError.message
                : 'No se pudo guardar la tarea.');
            return false;
        }
    };

    return { tasks, loading, error, toggleCompleted, deleteTask, saveEdit };
}
