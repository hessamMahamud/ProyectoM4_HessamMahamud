import { useMemo, useSyncExternalStore } from 'react'
import {
    collection,
    onSnapshot,
    query,
    where,
} from 'firebase/firestore'
import type { DocumentData } from 'firebase/firestore'
import { db } from '../services/firebase'

interface CollectionSnapshot<T> {
    data: T[];
    loading: boolean;
    error: string;
}

type Listener = () => void

function createCollectionStore<T>(
    userId: string | undefined,
    collectionName: string,
    mapDocument: (data: DocumentData, id: string) => T,
) {
    let snapshot: CollectionSnapshot<T> = {
        data: [],
        loading: Boolean(userId),
        error: '',
    }
    let unsubscribe: (() => void) | null = null
    const listeners = new Set<Listener>()

    const notify = (): void => {
        listeners.forEach((listener) => listener())
    }

    const subscribe = (listener: Listener): (() => void) => {
        listeners.add(listener)

        if (listeners.size === 1 && userId) {
            const userQuery = query(
                collection(db, collectionName),
                where('userId', '==', userId),
            )

            unsubscribe = onSnapshot(
                userQuery,
                (querySnapshot) => {
                    snapshot = {
                        data: querySnapshot.docs.map((document) => mapDocument(document.data(), document.id)),
                        loading: false,
                        error: '',
                    }
                    notify()
                },
                (snapshotError) => {
                    snapshot = {
                        ...snapshot,
                        loading: false,
                        error: snapshotError instanceof Error
                            ? snapshotError.message
                            : `Error al obtener ${collectionName}.`,
                    }
                    notify()
                },
            )
        }

        return () => {
            listeners.delete(listener)
            if (listeners.size === 0 && unsubscribe) {
                unsubscribe()
                unsubscribe = null
            }
        }
    }

    return {
        getSnapshot: () => snapshot,
        subscribe,
    }
}

export default function useFirestoreCollection<T>(
    userId: string | undefined,
    collectionName: string,
    mapDocument: (data: DocumentData, id: string) => T,
): CollectionSnapshot<T> {
    const store = useMemo(
        () => createCollectionStore(userId, collectionName, mapDocument),
        [userId, collectionName, mapDocument],
    )

    return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
}
