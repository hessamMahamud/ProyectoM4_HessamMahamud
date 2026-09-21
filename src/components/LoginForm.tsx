import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../features/auth/Authenticator.tsx'
import './LoginForm.css'

function LoginForm() {
    const { signIn, signUp, signInWithGoogle } = useAuth()
    const [mode, setMode] = useState<'login' | 'register'>('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            if (mode === 'login') {
                await signIn(email, password)
            } else {
                await signUp(email, password)
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message)
            } else {
                setError('Ocurrió un error inesperado')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSignIn = async () => {
        setError('')
        setLoading(true)
        try {
            await signInWithGoogle()
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message)
            } else {
                setError('Ocurrió un error inesperado al iniciar sesión con Google')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="login-logo">🌱</div>
                    <h2>
                        {mode === 'login' ? (
                            <>Bienvenido de <span className="highlight-orange">vuelta</span></>
                        ) : (
                            <>Crea tu <span className="highlight-orange">cuenta</span></>
                        )}
                    </h2>
                    <p>
                        {mode === 'login'
                            ? 'Conecta con tu propósito diario y mantén el equilibrio.'
                            : 'Comienza a organizar tu día con enfoque y serenidad.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <input
                        type="email"
                        className="form-input"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                    />

                    <input
                        type="password"
                        className="form-input"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                    />

                    {error && (
                        <p className="login-error">
                            {error}
                        </p>
                    )}

                    <button type="submit" className="btn-pill-primary login-submit" disabled={loading}>
                        {loading ? 'Cargando...' : mode === 'login' ? 'Entrar' : 'Crear mi cuenta'}
                    </button>
                </form>

                <div className="auth-divider">o también</div>

                <button type="button" className="btn-google" onClick={handleGoogleSignIn} disabled={loading}>
                    <svg width="18" height="18" viewBox="0 0 24 24">
                        <path
                            fill="#4285F4"
                            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                        />
                    </svg>
                    Continuar con Google
                </button>

                <button
                    type="button"
                    className="auth-toggle-btn"
                    onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                    disabled={loading}
                >
                    {mode === 'login'
                        ? '¿No tienes cuenta? Regístrate gratis'
                        : '¿Ya tienes cuenta? Inicia sesión'}
                </button>
            </div>
        </div>
    )
}

export default LoginForm
