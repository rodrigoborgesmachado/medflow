import { Button, Group, Stack, Text, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '../../../components/PageHeader/PageHeader';
import { getPatients } from '../../../services/patientService';
import type { Patient } from '../../../types/Patient';
import { PatientCard } from '../components/PatientCard';
import { PatientFormModal } from '../components/PatientFormModal';

export function PatientsPage() {
    const [opened, { open, close }] = useDisclosure(false);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPatients = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();

        if (!term) {
            return patients;
        }

        return patients.filter(patient =>
            patient.name.toLowerCase().includes(term)
        );
    }, [patients, searchTerm]);

    async function loadPatients() {
        const result = await getPatients();

        setPatients(result);
    }

    useEffect(() => {
        loadPatients();
    }, []);

    return (
        <>
            <PageHeader title="Pacientes">
                <Button onClick={open}>Novo paciente</Button>
            </PageHeader>

            <Stack>
                <Group>
                    <TextInput
                        placeholder="Buscar paciente pelo nome..."
                        value={searchTerm}
                        onChange={event => setSearchTerm(event.currentTarget.value)}
                        style={{ flex: 1 }}
                    />

                    {searchTerm && (
                        <Button variant="light" onClick={() => setSearchTerm('')}>
                            Limpar
                        </Button>
                    )}
                </Group>

                <Text c="dimmed" size="sm">
                    {filteredPatients.length} paciente(s) encontrado(s)
                </Text>

                {filteredPatients.map(patient => (
                    <PatientCard key={patient.id} patient={patient} />
                ))}

                {filteredPatients.length === 0 && (
                    <Text c="dimmed">
                        Nenhum paciente encontrado.
                    </Text>
                )}
            </Stack>

            <PatientFormModal
                opened={opened}
                onClose={close}
                onSuccess={loadPatients}
            />
        </>
    );
}