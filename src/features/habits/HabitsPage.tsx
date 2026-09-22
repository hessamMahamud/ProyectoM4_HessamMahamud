import { useState } from 'react'
import type { FormEvent } from 'react'
import { Check, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { useAuth } from '../auth/Authenticator.tsx'
import useHabits from '../../hooks/useHabits'
import type { Habit } from '../../hooks/useHabits'
import './HabitsPage.css'

export default function HabitsPage() {
    const { user } = useAuth();
    const { habits, loading, error, addHabit, toggleCompleted, deleteHabit, saveEdit } = useHabits(user?.uid);
    const [newTitle, setNewTitle] = useState<string>('');
    const [newType, setNewType] = useState<Habit['type']>('build');
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState<string>('');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<boolean>(false);

    const handleAddHabit = async (event: FormEvent): Promise<void> => {
        event.preventDefault();
        setSubmitting(true);
        const added = await addHabit(newTitle, newType);
        if (added) setNewTitle('');
        setSubmitting(false);
    };

    const handleStartEdit = (habit: Habit): void => {
        setOpenMenuId(null);
        setEditingHabitId(habit.id);
        setEditTitle(habit.title);
    };

    const handleCancelEdit = (): void => {
        setEditingHabitId(null);
        setEditTitle('');
    };

    const handleSaveEdit = async (habitId: string): Promise<void> => {
        setActionLoading(true);
        const saved = await saveEdit(habitId, editTitle);
        if (saved) handleCancelEdit();
        setActionLoading(false);
    };

    const buildHabits = habits.filter((habit) => habit.type === 'build');
    const quitHabits = habits.filter((habit) => habit.type === 'quit');
    const completedBuildHabits = buildHabits.filter((habit) => habit.completed).length;

    const renderHabit = (habit: Habit) => {
        const isEditing = editingHabitId === habit.id;

        return (
            <div className={`habit-item ${habit.completed ? 'is-done' : ''}`} key={habit.id}>
                {isEditing ? (
                    <form className="habit-edit-form" onSubmit={(event) => { event.preventDefault(); void handleSaveEdit(habit.id); }}>
                        <input
                            type="text"
                            className="form-input"
                            value={editTitle}
                            onChange={(event) => setEditTitle(event.target.value)}
                            disabled={actionLoading}
                            autoFocus
                        />
                        <div className="habit-edit-actions">
                            <button type="submit" className="btn-pill-primary habit-small-button" disabled={actionLoading}>
                                {actionLoading ? 'Guardando...' : 'Guardar'}
                            </button>
                            <button type="button" className="btn-pill-secondary habit-small-button" onClick={handleCancelEdit} disabled={actionLoading}>
                                Cancelar
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
                        <input
                            type="checkbox"
                            checked={habit.completed}
                            onChange={() => void toggleCompleted(habit)}
                            aria-label={`Completar hábito: ${habit.title}`}
                        />
                        <span className="habit-checkmark"><Check size={14} strokeWidth={3} /></span>
                        <span className="habit-item-copy">
                            <strong>{habit.title}</strong>
                            <small>{habit.completed ? 'Completado hoy' : habit.type === 'build' ? 'Un paso más para construirlo' : 'Un paso más para soltarlo'}</small>
                        </span>
                        <span className="habit-actions-wrap">
                            <button
                                type="button"
                                className="habit-menu-trigger"
                                onClick={() => setOpenMenuId(openMenuId === habit.id ? null : habit.id)}
                                aria-label={`Abrir acciones de ${habit.title}`}
                                aria-expanded={openMenuId === habit.id}
                            >
                                <MoreHorizontal size={18} />
                            </button>
                            <span className={`habit-actions-menu ${openMenuId === habit.id ? 'is-open' : ''}`}>
                                <button type="button" onClick={() => handleStartEdit(habit)} aria-label="Editar hábito"><Pencil size={14} /></button>
                                <button type="button" onClick={() => { setOpenMenuId(null); void deleteHabit(habit.id); }} aria-label="Eliminar hábito"><Trash2 size={14} /></button>
                            </span>
                        </span>
                    </>
                )}
            </div>
        );
    };

    return (
        <section className="feature-page habits-page">
            <header className="feature-page-header">
                <div>
                    <span className="feature-eyebrow">Rituales diarios</span>
                    <h2>Hábitos & bienestar</h2>
                    <p>Pequeñas decisiones que construyen días más ligeros.</p>
                </div>
                <div className="habit-score-chip">
                    <strong>{completedBuildHabits}/{buildHabits.length}</strong>
                    <span>cumplidos</span>
                </div>
            </header>

            <section className="habit-hero-card">
                <div>
                    <span className="habit-hero-kicker">Tu intención de hoy</span>
                    <h3>Avanza con constancia, no con perfección.</h3>
                    <p>Marca lo que ya hiciste y observa tu ritmo sin juicios.</p>
                </div>
                <span className="habit-hero-mark">◒</span>
            </section>

            <form className="habit-create-form" onSubmit={(event) => void handleAddHabit(event)}>
                <div className="habit-create-heading">
                    <div>
                        <span className="feature-eyebrow">Nuevo hábito</span>
                        <h3>Define una intención</h3>
                    </div>
                    <Plus size={20} aria-hidden="true" />
                </div>
                <div className="habit-create-fields">
                    <input
                        type="text"
                        className="form-input"
                        value={newTitle}
                        onChange={(event) => setNewTitle(event.target.value)}
                        placeholder="Ej. Leer 10 minutos"
                        disabled={submitting}
                        required
                    />
                    <select className="form-input" value={newType} onChange={(event) => setNewType(event.target.value as Habit['type'])} disabled={submitting}>
                        <option value="build">Para hacer</option>
                        <option value="quit">Para dejar</option>
                    </select>
                </div>
                <button type="submit" className="btn-pill-primary" disabled={submitting}>
                    {submitting ? 'Guardando...' : 'Agregar hábito'}
                </button>
            </form>

            {error && <p className="habit-error" role="alert">{error}</p>}
            {loading ? (
                <div className="habit-loading">Cargando tus hábitos...</div>
            ) : (
                <div className="habit-sections">
                    <section className="habit-list-section">
                        <div className="habit-section-heading">
                            <div>
                                <span className="feature-eyebrow">Construir</span>
                                <h3>Hábitos a mejorar</h3>
                            </div>
                            <span className="habit-count">{buildHabits.length}</span>
                        </div>
                        <div className="habit-list">
                            {buildHabits.length > 0 ? buildHabits.map(renderHabit) : <p className="habit-empty">Aún no tienes hábitos para construir.</p>}
                        </div>
                    </section>

                    <section className="habit-list-section habit-leave-section">
                        <div className="habit-section-heading">
                            <div>
                                <span className="feature-eyebrow">Soltar</span>
                                <h3>Hábitos que quieres dejar</h3>
                            </div>
                            <span className="habit-count">{quitHabits.length}</span>
                        </div>
                        <div className="habit-list">
                            {quitHabits.length > 0 ? quitHabits.map(renderHabit) : <p className="habit-empty">Aún no tienes hábitos para dejar.</p>}
                        </div>
                    </section>
                </div>
            )}
        </section>
    );
}
