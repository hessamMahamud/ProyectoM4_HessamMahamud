import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Task } from '../hooks/useTasks'
import TaskList from './TaskList'

const tasks: Task[] = [
    {
        id: 'pending-1',
        title: 'Caminar',
        description: 'Dar una vuelta',
        completed: false,
        userId: 'user-123',
        createdAt: null,
    },
    {
        id: 'completed-1',
        title: 'Meditar',
        description: 'Diez minutos',
        completed: true,
        userId: 'user-123',
        createdAt: null,
    },
]

describe('TaskList', () => {
    const toggleCompleted = vi.fn<(task: Task) => Promise<void>>()
    const deleteTask = vi.fn<(taskId: string) => Promise<void>>()
    const saveEdit = vi.fn<(taskId: string, title: string, description: string) => Promise<boolean>>()

    beforeEach(() => {
        vi.clearAllMocks()
        toggleCompleted.mockResolvedValue(undefined)
        deleteTask.mockResolvedValue(undefined)
        saveEdit.mockResolvedValue(true)
    })

    const renderTaskList = (taskItems: Task[] = tasks) => render(
        <TaskList
            tasks={taskItems}
            loading={false}
            error=""
            toggleCompleted={toggleCompleted}
            deleteTask={deleteTask}
            saveEdit={saveEdit}
        />,
    )

    it('renderiza los títulos recibidos por props', () => {
        renderTaskList()

        expect(screen.getByText('Caminar')).toBeInTheDocument()
        expect(screen.getByText('Meditar')).toBeInTheDocument()
    })

    it('notifica la tarea correcta al marcar el checkbox', async () => {
        const user = userEvent.setup()
        renderTaskList()

        await user.click(screen.getByRole('checkbox', { name: 'Completar tarea: Caminar' }))

        expect(toggleCompleted).toHaveBeenCalledOnce()
        expect(toggleCompleted).toHaveBeenCalledWith(tasks[0])
    })

    it('elimina la tarea con el id correcto', async () => {
        const user = userEvent.setup()
        renderTaskList()

        await user.click(screen.getAllByRole('button', { name: 'Eliminar tarea' })[1])

        expect(deleteTask).toHaveBeenCalledOnce()
        expect(deleteTask).toHaveBeenCalledWith('completed-1')
    })

    it('filtra tareas pendientes y completadas', async () => {
        const user = userEvent.setup()
        renderTaskList()

        await user.click(screen.getByRole('button', { name: 'Pendientes' }))
        expect(screen.getByText('Caminar')).toBeInTheDocument()
        expect(screen.queryByText('Meditar')).not.toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: 'Completadas' }))
        expect(screen.getByText('Meditar')).toBeInTheDocument()
        expect(screen.queryByText('Caminar')).not.toBeInTheDocument()
    })

    it('muestra el estado vacío cuando el filtro no tiene tareas', async () => {
        const user = userEvent.setup()
        renderTaskList([tasks[1]])

        await user.click(screen.getByRole('button', { name: 'Pendientes' }))

        expect(screen.getByText('Todo al día y en armonía')).toBeInTheDocument()
    })
})
