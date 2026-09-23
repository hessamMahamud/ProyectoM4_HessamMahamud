

import { useEffect, useState } from 'react'
import type { ReactElement, ReactNode } from "react";
import { auth } from "../../services/firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
} from "firebase/auth";
import type { User, UserCredential } from "firebase/auth";
import { AuthContext } from './AuthContext'

export interface AuthContextValue {
    user: User | null;
    loading: boolean;
    signUp: (email: string, password: string) => Promise<UserCredential>;
    signIn: (email: string, password: string) => Promise<UserCredential>;
    signInWithGoogle: () => Promise<UserCredential>;
    logout: () => Promise<void>;
}

export function Authenticator({ children }: { children: ReactNode }): ReactElement {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const signUp = (email: string, password: string) =>
        createUserWithEmailAndPassword(auth, email, password);
    const signIn = (email: string, password: string) =>
        signInWithEmailAndPassword(auth, email, password);
    const signInWithGoogle = () =>
        signInWithPopup(auth, new GoogleAuthProvider());
    const logout = () => signOut(auth);

    const value: AuthContextValue = {
        user, loading, signUp, signIn, signInWithGoogle, logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
