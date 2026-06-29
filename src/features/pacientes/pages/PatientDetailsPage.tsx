import { Card, Stack, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { PageHeader } from '../../../components/PageHeader/PageHeader';
import { getAttendancesByPatient } from '../../../services/attendanceService';
import { getPatients } from '../../../services/patientService';
import type { Attendance } from '../../../types/Attendance';
import type { Patient } from '../../../types/Patient';
import { PatientAttendanceCard } from '../components/PatientAttendanceCard';
import { CompleteAttendanceModal } from '../../atendimentos/components/CompleteAttendanceModal';

export function PatientDetailsPage() {
    const { id } = useParams();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [attendances, setAttendances] = useState<Attendance[]>([]);
    const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
    const [modalOpened, modalHandlers] = useDisclosure(false);

    async function loadData() {
        const patients = await getPatients();
        const foundPatient = patients.find(item => item.id === Number(id));

        setPatient(foundPatient ?? null);

        if (foundPatient) {
            const patientAttendances = await getAttendancesByPatient(foundPatient.id);
            setAttendances(patientAttendances);
        }
    }

    function handleEditReport(attendance: Attendance) {
        setSelectedAttendance(attendance);
        modalHandlers.open();
    }

    useEffect(() => {
        loadData();
    }, [id]);

    if (!patient) {
        return <Text>Paciente não encontrado.</Text>;
    }

    return (
        <>
            <PageHeader title={patient.name} />

            <Stack>
                <Card withBorder shadow="sm" padding="lg">
                    <Title order={3}>Informações</Title>
                    <Text>Telefone: {patient.phone || '-'}</Text>
                    <Text>Email: {patient.email || '-'}</Text>
                    <Text>Documento: {patient.document || '-'}</Text>
                    <Text>Profissão: {patient.profession || '-'}</Text>
                    <Text>Endereço: {patient.address || '-'}</Text>
                    <Text>Observações: {patient.observations || '-'}</Text>
                </Card>

                <Card withBorder shadow="sm" padding="lg">
                    <Title order={3}>Atendimentos</Title>

                    <Stack mt="md">
                        {attendances.length === 0 && (
                            <Text c="dimmed">Nenhum atendimento encontrado.</Text>
                        )}

                        {attendances.map(attendance => (
                            <PatientAttendanceCard
                                key={attendance.id}
                                attendance={attendance}
                                onEditReport={handleEditReport}
                            />
                        ))}
                    </Stack>
                </Card>
            </Stack>

            <CompleteAttendanceModal
                opened={modalOpened}
                attendance={selectedAttendance}
                onClose={modalHandlers.close}
                onSuccess={loadData}
            />
        </>
    );
}