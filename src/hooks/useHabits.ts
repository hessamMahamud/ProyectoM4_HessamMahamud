import { useEffect, useState } from 'react'
import type { Timestamp } from 'firebase/firestore'
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from 'firebase/firestore'
import { db } from '../services/firebase'

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

export default function useHabits(userId: string | undefined): UseHabitsResult {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (!userId) {
            setHabits([]);
            setLoading(false);
            setError('');
            return;
        }

        setLoading(true);
        setError('');

        const habitsQuery = query(
            collection(db, 'habits'),
            where('userId', '==', userId),
        );

        const unsubscribe = onSnapshot(
            habitsQuery,
            (snapshot) => {
                const fetchedHabits: Habit[] = snapshot.docs.map((habitSnapshot) => {
                    const data = habitSnapshot.data();
                    const type = data.type === 'quit' ? 'quit' : 'build';

                    return {
                        id: habitSnapshot.id,
                        title: data.title ?? '',
                        type,
                        completed: Boolean(data.completed),
                        userId: data.userId ?? '',
                        createdAt: data.createdAt ?? null,
                    };
                });

                fetchedHabits.sort((firstHabit, secondHabit) => {
                    const firstTime = firstHabit.createdAt?.toMillis() ?? 0;
                    const secondTime = secondHabit.createdAt?.toMillis() ?? 0;
                    return secondTime - firstTime;
                });

                setHabits(fetchedHabits);
                setLoading(false);
            },
            (snapshotError) => {
                setError(snapshotError instanceof Error
                    ? snapshotError.message
                    : 'Error al obtener los hábitos en tiempo real.');
                setLoading(false);
            },
        );

        return () => unsubscribe();
    }, [userId]);

    const addHabit = async (title: string, type: Habit['type']): Promise<boolean> => {
        const trimmedTitle = title.trim();
        if (!trimmedTitle || !userId) {
            setError(!trimmedTitle ? 'El título del hábito no puede estar vacío.' : 'Debes iniciar sesión para crear un hábito.');
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
            setError(actionError instanceof Error
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
            setError(actionError instanceof Error
                ? actionError.message
                : 'No se pudo actualizar el hábito.');
        }
    };

    const deleteHabit = async (habitId: string): Promise<void> => {
        if (!window.confirm('¿Seguro que deseas eliminar este hábito?')) return;

        try {
            await deleteDoc(doc(db, 'habits', habitId));
        } catch (actionError) {
            setError(actionError instanceof Error
                ? actionError.message
                : 'No se pudo eliminar el hábito.');
        }
    };

    const saveEdit = async (habitId: string, title: string): Promise<boolean> => {
        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            setError('El título del hábito no puede estar vacío.');
            return false;
        }

        try {
            await updateDoc(doc(db, 'habits', habitId), {
                title: trimmedTitle,
            });
            return true;
        } catch (actionError) {
            setError(actionError instanceof Error
                ? actionError.message
                : 'No se pudo guardar el hábito.');
            return false;
        }
    };

    return { habits, loading, error, addHabit, toggleCompleted, deleteHabit, saveEdit };
}
