import type { VercelRequest, VercelResponse } from '@vercel/node'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { sendMock, sendEmailCommandMock, sesClientMock } = vi.hoisted(() => ({
    sendMock: vi.fn(),
    sendEmailCommandMock: vi.fn(function (input: unknown) { return input }),
    sesClientMock: vi.fn(function () { return { send: sendMock } }),
}))

vi.mock('@aws-sdk/client-ses', () => ({
    SESClient: sesClientMock,
    SendEmailCommand: sendEmailCommandMock,
}))

import handler from './send-task-summary'

describe('send-task-summary', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        sendMock.mockResolvedValue({})
    })

    const createResponse = () => {
        const statusMock = vi.fn()
        const jsonMock = vi.fn()
        const response = { status: statusMock, json: jsonMock } as unknown as VercelResponse
        statusMock.mockReturnValue(response)
        return { response, statusMock, jsonMock }
    }

    const createRequest = (body: unknown, method = 'POST') => ({
        method,
        body,
    }) as VercelRequest

    it('devuelve 405 si el método no es POST', async () => {
        const { response, statusMock, jsonMock } = createResponse()

        await handler(createRequest({}, 'GET'), response)

        expect(statusMock).toHaveBeenCalledWith(405)
        expect(jsonMock).toHaveBeenCalledWith({ error: 'Método no permitido.' })
        expect(sesClientMock).not.toHaveBeenCalled()
    })

    it.each([
        { recipient: 'correo-invalido', tasks: [] },
        { recipient: 'persona@example.com', tasks: 'no es un array' },
    ])('devuelve 400 para payload inválido: %j', async (body) => {
        const { response, statusMock, jsonMock } = createResponse()

        await handler(createRequest(body), response)

        expect(statusMock).toHaveBeenCalledWith(400)
        expect(jsonMock).toHaveBeenCalledWith({ error: 'Los datos del resumen no son válidos.' })
        expect(sesClientMock).not.toHaveBeenCalled()
    })

    it('envía el resumen una sola vez cuando el payload es válido', async () => {
        const { response, statusMock, jsonMock } = createResponse()
        const body = {
            recipient: 'persona@example.com',
            tasks: [{ title: 'Leer', description: '20 páginas', completed: false }],
        }

        await handler(createRequest(body), response)

        expect(statusMock).toHaveBeenCalledWith(200)
        expect(jsonMock).toHaveBeenCalledWith({ message: 'Resumen enviado correctamente.' })
        expect(sesClientMock).toHaveBeenCalledOnce()
        expect(sendEmailCommandMock).toHaveBeenCalledOnce()
        expect(sendMock).toHaveBeenCalledOnce()
    })

    it('devuelve 500 si AWS SES rechaza el envío', async () => {
        const { response, statusMock, jsonMock } = createResponse()
        const body = {
            recipient: 'persona@example.com',
            tasks: [{ title: 'Leer', description: '20 páginas', completed: false }],
        }
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { })
        sendMock.mockRejectedValueOnce(new Error('MessageRejected: Email address is not verified'))

        try {
            await handler(createRequest(body), response)

            expect(statusMock).toHaveBeenCalledWith(500)
            expect(jsonMock).toHaveBeenCalledWith({ error: 'No se pudo enviar el resumen.' })
            expect(consoleErrorSpy).toHaveBeenCalled()
        } finally {
            consoleErrorSpy.mockRestore()
        }
    })
})
