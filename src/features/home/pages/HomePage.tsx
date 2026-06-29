import { Button, Card, Container, Loader, Stack, Text, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { loadSavedMainDirectory, selectMainDirectory } from '../../../services/fileSystemService';

export function HomePage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadSavedDirectory() {
            try {
                const directory = await loadSavedMainDirectory();

                if (directory) {
                    navigate('/dashboard');
                    return;
                }
            } finally {
                setLoading(false);
            }
        }

        loadSavedDirectory();
    }, [navigate]);

    async function handleSelectDirectory() {
        try {
            await selectMainDirectory();

            toast.success('Estrutura carregada com sucesso.');
            navigate('/dashboard');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao selecionar pasta.';

            toast.error(message);
        }
    }

    if (loading) {
        return (
            <Container size="sm" py="xl">
                <Loader />
            </Container>
        );
    }

    return (
        <Container size="sm" py="xl">
            <Card shadow="sm" padding="xl" radius="md" withBorder>
                <Stack>
                    <Title order={1}>MedFlow Agenda</Title>

                    <Text c="dimmed">
                        Selecione a pasta principal para criar ou carregar os dados do sistema.
                    </Text>

                    <Button onClick={handleSelectDirectory}>
                        Selecionar pasta principal
                    </Button>
                </Stack>
            </Card>
        </Container>
    );
}