import { useState } from 'react'
import type { DocumentData, Timestamp } from 'firebase/firestore'
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    serverTimestamp,
    updateDoc,
} from 'firebase/firestore'
import { db } from '../services/firebase'
import useFirestoreCollection from './useFirestoreCollection'

export interface Habit {
    id: string;
    title: string;
    type: 'build' | 'quit';
    completed: boolean;
    userId: string;
    createdAt: Timestamp | null;
}

export interface UseHabitsResult {
    habits: Habit[];
    loading: boolean;
    error: string;
    addHabit: (title: string, type: Habit['type']) => Promise<boolean>;
    toggleCompleted: (habit: Habit) => Promise<void>;
    deleteHabit: (habitId: string) => Promise<void>;
    saveEdit: (habitId: string, title: string) => Promise<boolean>;
}

const mapHabit = (data: DocumentData, id: string): Habit => ({
    id,
    title: data.title ?? '',
    type: (data.type === 'quit' ? 'quit' : 'build') as Habit['type'],
    completed: Boolean(data.completed),
    userId: data.userId ?? '',
    createdAt: data.createdAt ?? null,
});

export default function useHabits(userId: string | undefined): UseHabitsResult {
    const [actionError, setActionError] = useState<string>('');
    const { data: habits, loading, error: queryError } = useFirestoreCollection(
        userId,
        'habits',
        mapHabit,
    );

    const sortedHabits = [...habits].sort((firstHabit, secondHabit) => {
        const firstTime = firstHabit.createdAt?.toMillis() ?? 0;
        const secondTime = secondHabit.createdAt?.toMillis() ?? 0;
        return secondTime - firstTime;
    });

    const addHabit = async (title: string, type: Habit['type']): Promise<boolean> => {
        const trimmedTitle = title.trim();
        if (!trimmedTitle || !userId) {
            setActionError(!trimmedTitle ? 'El título del hábito no puede estar vacío.' : 'Debes iniciar sesión para crear un hábito.');
            return false;
        }

        try {
            await addDoc(collection(db, 'habits'), {
                title: trimmedTitle,
                type,
                completed: false,
                userId,
                createdAt: serverTimestamp(),
            });
            return true;
        } catch (actionError) {
            setActionError(actionError instanceof Error
                ? actionError.message
                : 'No se pudo crear el hábito.');
            return false;
        }
    };

    const toggleCompleted = async (habit: Habit): Promise<void> => {
        try {
            await updateDoc(doc(db, 'habits', habit.id), {
                completed: !habit.completed,
            });
        } catch (actionError) {
            setActionError(actionError instanceof Error
                ? actionError.message
                : 'No se pudo actualizar el hábito.');
        }
    };

    const deleteHabit = async (habitId: string): Promise<void> => {
        if (!window.confirm('¿Seguro que deseas eliminar este hábito?')) return;

        try {
            await deleteDoc(doc(db, 'habits', habitId));
        } catch (actionError) {
            setActionError(actionError instanceof Error
                ? actionError.message
                : 'No se pudo eliminar el hábito.');
        }
    };

    const saveEdit = async (habitId: string, title: string): Promise<boolean> => {
        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            setActionError('El título del hábito no puede estar vacío.');
            return false;
        }

        try {
            await updateDoc(doc(db, 'habits', habitId), {
                title: trimmedTitle,
            });
            return true;
        } catch (actionError) {
            setActionError(actionError instanceof Error
                ? actionError.message
                : 'No se pudo guardar el hábito.');
            return false;
        }
    };

    return { habits: sortedHabits, loading, error: actionError || queryError, addHabit, toggleCompleted, deleteHabit, saveEdit };
}
