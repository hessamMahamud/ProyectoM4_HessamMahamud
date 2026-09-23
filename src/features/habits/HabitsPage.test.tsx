import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Habit } from '../../hooks/useHabits'
import HabitsPage from './HabitsPage'

const { habitsHookMock } = vi.hoisted(() => ({
    habitsHookMock: {
        habits: [] as Habit[],
        loading: false,
        error: '',
        addHabit: vi.fn(),
        toggleCompleted: vi.fn(),
        deleteHabit: vi.fn(),
        saveEdit: vi.fn(),
    },
}))

vi.mock('../../hooks/useHabits', () => ({
    default: () => habitsHookMock,
}))

vi.mock('../auth/Authenticator.tsx', () => ({
    useAuth: () => ({ user: { uid: 'user-123' } }),
}))

const buildHabit: Habit = {
    id: 'habit-1',
    title: 'Caminar',
    type: 'build',
    completed: false,
    userId: 'user-123',
    createdAt: null,
}

describe('HabitsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        habitsHookMock.habits = [buildHabit]
        habitsHookMock.saveEdit.mockResolvedValue(true)
    })

    it('marca el hábito al pulsar la casilla visible', async () => {
        const user = userEvent.setup()
        const { container } = render(<HabitsPage />)

        await user.click(container.querySelector('.habit-checkmark')!)

        expect(habitsHookMock.toggleCompleted).toHaveBeenCalledWith(buildHabit)
    })

    it('guarda el título editado desde el menú de acciones', async () => {
        const user = userEvent.setup()
        render(<HabitsPage />)

        await user.click(screen.getByRole('button', { name: 'Abrir acciones de Caminar' }))
        await user.click(screen.getByRole('button', { name: 'Editar hábito' }))

        const input = screen.getByDisplayValue('Caminar')
        await user.clear(input)
        await user.type(input, '  Caminar por la tarde  ')
        fireEvent.submit(input.closest('form')!)

        expect(habitsHookMock.saveEdit).toHaveBeenCalledWith('habit-1', '  Caminar por la tarde  ')
    })
})
