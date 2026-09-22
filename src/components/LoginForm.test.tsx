import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import LoginForm from './LoginForm'

const { signInMock, signUpMock, signInWithGoogleMock } = vi.hoisted(() => ({
    signInMock: vi.fn(),
    signUpMock: vi.fn(),
    signInWithGoogleMock: vi.fn(),
}))

vi.mock('../features/auth/Authenticator.tsx', () => ({
    useAuth: () => ({
        signIn: signInMock,
        signUp: signUpMock,
        signInWithGoogle: signInWithGoogleMock,
    }),
}))

describe('LoginForm', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        signInMock.mockResolvedValue(undefined)
        signUpMock.mockResolvedValue(undefined)
        signInWithGoogleMock.mockResolvedValue(undefined)
    })

    it('alterna entre login y registro', async () => {
        const user = userEvent.setup()
        render(<LoginForm />)

        expect(screen.getByRole('heading', { name: /Bienvenido de vuelta/ })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: '¿No tienes cuenta? Regístrate gratis' }))

        expect(screen.getByRole('heading', { name: /Crea tu cuenta/ })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Crear mi cuenta' })).toBeInTheDocument()
    })

    it('muestra el error cuando signIn rechaza la promesa', async () => {
        const user = userEvent.setup()
        signInMock.mockRejectedValueOnce(new Error('Credenciales incorrectas'))
        render(<LoginForm />)

        await user.type(screen.getByPlaceholderText('Correo electrónico'), 'persona@example.com')
        await user.type(screen.getByPlaceholderText('Contraseña'), 'incorrecta')
        await user.click(screen.getByRole('button', { name: 'Entrar' }))

        expect(await screen.findByText('Credenciales incorrectas')).toBeInTheDocument()
        expect(signInMock).toHaveBeenCalledWith('persona@example.com', 'incorrecta')
    })
})
