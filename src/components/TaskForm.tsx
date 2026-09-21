import { useState } from 'react'
import type { FormEvent, ReactElement } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../features/auth/Authenticator.tsx'

export default function TaskForm(): ReactElement {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent): Promise<void> => {
        e.preventDefault();
        if (!user) {
            setError('Debes iniciar sesión para crear una tarea.');
            return;
        }

        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            setError('El título de la tarea es obligatorio.');
            return;
        }

        setError('');
        setSubmitting(true);

        try {
            await addDoc(collection(db, 'tasks'), {
                title: trimmedTitle,
                description: description.trim(),
                completed: false,
                userId: user.uid,
                createdAt: serverTimestamp(),
            });

            setTitle('');
            setDescription('');
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Ocurrió un error inesperado al crear la tarea.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3>Crear nueva tarea</h3>

            <input
                type="text"
                placeholder="Título de la tarea"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={submitting}
            />

            <textarea
                placeholder="Descripción (opcional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={submitting}
                rows={3}
                style={{ resize: 'vertical', fontFamily: 'inherit' }}
            />

            {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}

            <button type="submit" disabled={submitting}>
                {submitting ? 'Guardando...' : 'Agregar tarea'}
            </button>
        </form>
    );
}
