import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach, vi } from 'vitest'
import TaskForm from './TaskForm'

const { addDocMock, collectionMock, serverTimestampMock } = vi.hoisted(() => ({
    addDocMock: vi.fn(),
    collectionMock: vi.fn(() => 'tasks-reference'),
    serverTimestampMock: vi.fn(() => 'timestamp'),
}))

vi.mock('firebase/firestore', () => ({
    addDoc: addDocMock,
    collection: collectionMock,
    serverTimestamp: serverTimestampMock,
}))

vi.mock('../services/firebase', () => ({ db: 'firestore-db' }))

vi.mock('../features/auth/AuthContext', () => ({
    useAuth: () => ({ user: { uid: 'user-123' } }),
}))

describe('TaskForm', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        addDocMock.mockResolvedValue({ id: 'task-123' })
    })

    it.each(['', '   '])('no envía el formulario con título %j', async (title) => {
        const user = userEvent.setup()
        const { container } = render(<TaskForm />)

        if (title) {
            await user.type(screen.getByPlaceholderText('¿Qué quieres lograr hoy?'), title)
        }
        fireEvent.submit(container.querySelector('form')!)

        await waitFor(() => expect(addDocMock).not.toHaveBeenCalled())
    })

    it('envía los datos correctos cuando el título es válido', async () => {
        const user = userEvent.setup()
        render(<TaskForm />)

        await user.type(screen.getByPlaceholderText('¿Qué quieres lograr hoy?'), '  Leer 20 páginas  ')
        await user.type(screen.getByPlaceholderText('Detalles o notas de bienestar (opcional)...'), '  Antes de dormir  ')
        await user.click(screen.getByRole('button', { name: '+ Crear tarea' }))

        await waitFor(() => expect(addDocMock).toHaveBeenCalledOnce())
        expect(collectionMock).toHaveBeenCalledWith('firestore-db', 'tasks')
        expect(addDocMock).toHaveBeenCalledWith('tasks-reference', {
            title: 'Leer 20 páginas',
            description: 'Antes de dormir',
            completed: false,
            userId: 'user-123',
            createdAt: 'timestamp',
        })
    })

    it('muestra el error cuando addDoc rechaza la promesa', async () => {
        const user = userEvent.setup()
        addDocMock.mockRejectedValueOnce(new Error('No se pudo guardar la tarea.'))
        render(<TaskForm />)

        await user.type(screen.getByPlaceholderText('¿Qué quieres lograr hoy?'), 'Tarea fallida')
        await user.click(screen.getByRole('button', { name: '+ Crear tarea' }))

        expect(await screen.findByText('No se pudo guardar la tarea.')).toBeInTheDocument()
    })
})
