import { Loader, Stack, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router';
import { loadSavedMainDirectory } from '../../services/fileSystemService';

export function RequireDirectory() {
    const [loading, setLoading] = useState(true);
    const [hasDirectory, setHasDirectory] = useState(false);

    useEffect(() => {
        async function loadDirectory() {
            try {
                const directory = await loadSavedMainDirectory();

                setHasDirectory(!!directory);
            } finally {
                setLoading(false);
            }
        }

        loadDirectory();
    }, []);

    if (loading) {
        return (
            <Stack align="center" justify="center" h="100vh">
                <Loader />
                <Text c="dimmed">Carregando pasta selecionada...</Text>
            </Stack>
        );
    }

    if (!hasDirectory) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}