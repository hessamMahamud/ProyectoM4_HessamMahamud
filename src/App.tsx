import { useAuth } from './features/auth/Authenticator.tsx'
import LoginForm from './components/LoginForm.tsx'
import './App.css'

function App() {
    const { user, loading, logout } = useAuth();

    if (loading) {
        return (
            <section id="center">
                <p>Cargando sesión...</p>
            </section>
        );
    }

    if (!user) {
        return (
            <section id="center">
                <LoginForm />
            </section>
        );
    }

    return (
        <>
            <section id="center">
                <div>
                    <h1>Task Manager</h1>
                    <p>Mejora tu productividad </p>
                    <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>
                        Conectado como: <strong>{user.email || user.displayName || 'Usuario'}</strong>
                    </p>
                </div>
                <button type="button" onClick={() => void logout()}>
                    Cerrar sesión
                </button>
            </section>

            <div className="ticks"></div>

            <section id="next-steps">

            </section>

            <div className="ticks"></div>
            <section id="spacer"></section>
        </>
    );
}

export default App
