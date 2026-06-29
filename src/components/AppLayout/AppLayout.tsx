import { AppShell, Badge, Burger, Button, Group, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import {
    getProfessionalName,
    selectMainDirectory
} from '../../services/fileSystemService';
import { ProfessionalModal } from '../ProfessionalModal/ProfessionalModal';
import { Sidebar } from '../Sidebar/Sidebar';
import { Footer } from '../Footer/Footer';

export function AppLayout() {
    const [opened, { toggle }] = useDisclosure();
    const [professionalOpened, professionalHandlers] = useDisclosure(false);
    const [professionalName, setProfessionalName] = useState('');
    const [selectedFolderName, setSelectedFolderName] = useState(
        sessionStorage.getItem('medflow-root-name') ?? ''
    );

    const navigate = useNavigate();

    async function loadProfessionalName() {
        const result = await getProfessionalName();

        setProfessionalName(result);
        setSelectedFolderName(sessionStorage.getItem('medflow-root-name') ?? '');
    }

    async function handleChangeFolder() {
        try {
            await selectMainDirectory();

            toast.success('Pasta alterada com sucesso.');
            setSelectedFolderName(sessionStorage.getItem('medflow-root-name') ?? '');
            await loadProfessionalName();

            navigate('/dashboard');
            window.location.reload();
        } catch {
            toast.error('Erro ao alterar pasta.');
        }
    }

    useEffect(() => {
        loadProfessionalName();
    }, []);

    return (
        <>
            <AppShell
                header={{ height: 60 }}
                navbar={{
                    width: 260,
                    breakpoint: 'sm',
                    collapsed: { mobile: !opened }
                }}
                padding="md"
            >
                <AppShell.Header>
                    <Group h="100%" px="md" justify="space-between">
                        <Group>
                            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                            <Text fw={700}>MedFlow Agenda</Text>
                        </Group>

                        <Group>
                            {selectedFolderName && (
                                <Badge variant="light" size="lg">
                                    Pasta: {selectedFolderName}
                                </Badge>
                            )}

                            <Button variant="light" onClick={handleChangeFolder}>
                                Trocar pasta
                            </Button>

                            <Button variant="light" onClick={professionalHandlers.open}>
                                {professionalName || 'Definir profissional'}
                            </Button>
                        </Group>
                    </Group>
                </AppShell.Header>

                <AppShell.Navbar p="md">
                    <Sidebar />
                </AppShell.Navbar>

                <AppShell.Main>
                    <Outlet />
                </AppShell.Main>

                <AppShell.Footer>
                    <Footer />
                </AppShell.Footer>

            </AppShell>

            <ProfessionalModal
                opened={professionalOpened}
                onClose={professionalHandlers.close}
                onSuccess={loadProfessionalName}
            />
        </>
    );
}