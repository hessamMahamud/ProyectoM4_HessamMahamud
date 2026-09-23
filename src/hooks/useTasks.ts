import { useState } from 'react'
import type { DocumentData, Timestamp } from 'firebase/firestore'
import {
    deleteDoc,
    doc,
    updateDoc,
} from 'firebase/firestore'
import { db } from '../services/firebase'
import useFirestoreCollection from './useFirestoreCollection'

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

const mapTask = (data: DocumentData, id: string): Task => ({
    id,
    title: data.title ?? '',
    description: data.description ?? '',
    completed: Boolean(data.completed),
    userId: data.userId ?? '',
    createdAt: data.createdAt ?? null,
});

export default function useTasks(userId: string | undefined): UseTasksResult {
    const [actionError, setActionError] = useState<string>('');
    const { data: tasks, loading, error: queryError } = useFirestoreCollection(
        userId,
        'tasks',
        mapTask,
    );

    const sortedTasks = [...tasks].sort((firstTask, secondTask) => {
        const firstTime = firstTask.createdAt?.toMillis() ?? 0;
        const secondTime = secondTask.createdAt?.toMillis() ?? 0;
        return secondTime - firstTime;
    });

    const toggleCompleted = async (task: Task): Promise<void> => {
        try {
            await updateDoc(doc(db, 'tasks', task.id), {
                completed: !task.completed,
            });
        } catch (actionError) {
            setActionError(actionError instanceof Error
                ? actionError.message
                : 'No se pudo actualizar la tarea.');
        }
    };

    const deleteTask = async (taskId: string): Promise<void> => {
        if (!window.confirm('¿Seguro que deseas eliminar esta tarea?')) return;

        try {
            await deleteDoc(doc(db, 'tasks', taskId));
        } catch (actionError) {
            setActionError(actionError instanceof Error
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
            setActionError('El título no puede estar vacío.');
            return false;
        }

        try {
            await updateDoc(doc(db, 'tasks', taskId), {
                title: trimmedTitle,
                description: description.trim(),
            });
            return true;
        } catch (actionError) {
            setActionError(actionError instanceof Error
                ? actionError.message
                : 'No se pudo guardar la tarea.');
            return false;
        }
    };

    return { tasks: sortedTasks, loading, error: actionError || queryError, toggleCompleted, deleteTask, saveEdit };
}
