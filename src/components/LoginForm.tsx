import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../features/auth/AuthContext'
import GoogleIcon from './icons/GoogleIcon.tsx'
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
                    <GoogleIcon />
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
