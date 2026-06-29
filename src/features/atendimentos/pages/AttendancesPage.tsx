import { Button, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PageHeader } from '../../../components/PageHeader/PageHeader';
import { deleteAttendance, getAttendances } from '../../../services/attendanceService';
import type { Attendance } from '../../../types/Attendance';
import { AttendanceCalendarGrid } from '../components/AttendanceCalendarGrid';
import { AppointmentFormModal } from '../components/AppointmentFormModal';
import { CompleteAttendanceModal } from '../components/CompleteAttendanceModal';

export function AttendancesPage() {
    const [opened, { open, close }] = useDisclosure(false);
    const [completeOpened, completeHandlers] = useDisclosure(false);
    const [attendances, setAttendances] = useState<Attendance[]>([]);
    const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);

    async function loadAttendances() {
        const result = await getAttendances();

        setAttendances(result);
    }

    function handleComplete(attendance: Attendance) {
        setSelectedAttendance(attendance);
        completeHandlers.open();
    }

    async function handleDelete(attendance: Attendance) {
        const confirmed = window.confirm(`Remover o horario de ${attendance.patientName}?`);

        if (!confirmed) {
            return;
        }

        try {
            await deleteAttendance(attendance);
            toast.success('Horario removido com sucesso.');
            await loadAttendances();
        } catch {
            toast.error('Erro ao remover horario.');
        }
    }

    useEffect(() => {
        loadAttendances();
    }, []);

    return (
        <>
            <PageHeader title="Atendimentos">
                <Button onClick={open}>Novo atendimento</Button>
            </PageHeader>

            <Stack>
                <AttendanceCalendarGrid
                    attendances={attendances}
                    onComplete={handleComplete}
                    onDelete={handleDelete}
                />
            </Stack>

            <AppointmentFormModal
                opened={opened}
                onClose={close}
                onSuccess={loadAttendances}
            />

            <CompleteAttendanceModal
                opened={completeOpened}
                attendance={selectedAttendance}
                onClose={completeHandlers.close}
                onSuccess={loadAttendances}
            />
        </>
    );
}
