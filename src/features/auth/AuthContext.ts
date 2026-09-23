import { createContext, useContext } from 'react'
import type { AuthContextValue } from './Authenticator'

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth debe usarse dentro de un <Authenticator>')
    return context
}
