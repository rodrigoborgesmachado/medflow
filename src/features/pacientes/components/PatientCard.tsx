import { Button, Card, Group, Text, Title } from '@mantine/core';
import { useNavigate } from 'react-router';
import type { Patient } from '../../../types/Patient';

type PatientCardProps = {
    patient: Patient;
};

export function PatientCard({ patient }: PatientCardProps) {
    const navigate = useNavigate();

    return (
        <Card withBorder shadow="sm" padding="md">
            <Group justify="space-between">
                <div>
                    <Title order={4}>{patient.name}</Title>
                    <Text size="sm" c="dimmed">{patient.phone || 'Sem telefone'}</Text>
                </div>

                <Button variant="light" onClick={() => navigate(`/pacientes/${patient.id}`)}>
                    Ver detalhes
                </Button>
            </Group>
        </Card>
    );
}