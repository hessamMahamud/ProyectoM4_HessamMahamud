import { useState } from 'react'
import type { FormEvent, ReactElement } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../features/auth/AuthContext'
import './TaskForm.css'

interface TaskFormProps {
    onSuccess?: () => void;
}

export default function TaskForm({ onSuccess }: TaskFormProps = {}): ReactElement {
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
            if (onSuccess) {
                onSuccess();
            }
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
        <form onSubmit={handleSubmit} className="task-form">
            <div className="task-form-fields">
                <input
                    type="text"
                    className="form-input"
                    placeholder="¿Qué quieres lograr hoy?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    disabled={submitting}
                />

                <textarea
                    className="form-textarea"
                    placeholder="Detalles o notas de bienestar (opcional)..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={submitting}
                    rows={3}
                />
            </div>

            {error && (
                <p className="task-form-error">
                    {error}
                </p>
            )}

            <button type="submit" className="btn-pill-primary" disabled={submitting}>
                {submitting ? 'Guardando...' : '+ Crear tarea'}
            </button>
        </form>
    );
}
