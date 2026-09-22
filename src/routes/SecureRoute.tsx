import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../features/auth/Authenticator.tsx'

interface SecureRouteProps {
    children: ReactNode;
}

export default function SecureRoute({ children }: SecureRouteProps) {
    const { user, loading } = useAuth();

    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;

    return children;
}
