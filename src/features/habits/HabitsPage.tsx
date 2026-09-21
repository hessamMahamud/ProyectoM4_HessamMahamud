import { useState } from 'react'
import './HabitsPage.css'

interface Habit {
    id: number;
    name: string;
    detail: string;
    category: 'build' | 'leave';
    completed: boolean;
}

const initialHabits: Habit[] = [
    { id: 1, name: 'Beber agua', detail: 'Mantén tu energía durante el día', category: 'build', completed: false },
    { id: 2, name: 'Caminar 20 minutos', detail: 'Activa tu cuerpo con calma', category: 'build', completed: true },
    { id: 3, name: 'Revisar el teléfono al despertar', detail: 'Deja espacio para empezar presente', category: 'leave', completed: false },
    { id: 4, name: 'Posponer tu hora de descanso', detail: 'Protege tu rutina nocturna', category: 'leave', completed: false },
];

export default function HabitsPage() {
    const [habits, setHabits] = useState(initialHabits);

    const toggleHabit = (id: number) => {
        setHabits((currentHabits) => currentHabits.map((habit) => (
            habit.id === id ? { ...habit, completed: !habit.completed } : habit
        )));
    };

    const buildHabits = habits.filter((habit) => habit.category === 'build');
    const leaveHabits = habits.filter((habit) => habit.category === 'leave');
    const completedBuildHabits = buildHabits.filter((habit) => habit.completed).length;

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
                        {buildHabits.map((habit) => (
                            <label className={`habit-item ${habit.completed ? 'is-done' : ''}`} key={habit.id}>
                                <input type="checkbox" checked={habit.completed} onChange={() => toggleHabit(habit.id)} />
                                <span className="habit-checkmark">✓</span>
                                <span className="habit-item-copy">
                                    <strong>{habit.name}</strong>
                                    <small>{habit.detail}</small>
                                </span>
                            </label>
                        ))}
                    </div>
                </section>

                <section className="habit-list-section habit-leave-section">
                    <div className="habit-section-heading">
                        <div>
                            <span className="feature-eyebrow">Soltar</span>
                            <h3>Hábitos que quieres dejar</h3>
                        </div>
                        <span className="habit-count">{leaveHabits.length}</span>
                    </div>
                    <div className="habit-list">
                        {leaveHabits.map((habit) => (
                            <label className={`habit-item ${habit.completed ? 'is-done' : ''}`} key={habit.id}>
                                <input type="checkbox" checked={habit.completed} onChange={() => toggleHabit(habit.id)} />
                                <span className="habit-checkmark">✓</span>
                                <span className="habit-item-copy">
                                    <strong>{habit.name}</strong>
                                    <small>{habit.detail}</small>
                                </span>
                            </label>
                        ))}
                    </div>
                </section>
            </div>
        </section>
    );
}
