import { Button, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PageHeader } from '../../../components/PageHeader/PageHeader';
import { deleteAttendance, getAttendances } from '../../../services/attendanceService';
import type { Attendance } from '../../../types/Attendance';
import { getTodayDateInputValue } from '../../../utils/dateUtils';
import { DashboardAppointmentModal } from '../../dashboard/components/DashboardAppointmentModal';
import { AttendanceCalendarGrid } from '../components/AttendanceCalendarGrid';
import { CompleteAttendanceModal } from '../components/CompleteAttendanceModal';

export function AttendancesPage() {
    const [opened, { open, close }] = useDisclosure(false);
    const [completeOpened, completeHandlers] = useDisclosure(false);
    const [attendances, setAttendances] = useState<Attendance[]>([]);
    const [calendarDate, setCalendarDate] = useState(getTodayDateInputValue());
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
                    selectedDate={calendarDate}
                    onSelectedDateChange={setCalendarDate}
                    onComplete={handleComplete}
                    onDelete={handleDelete}
                />
            </Stack>

            <DashboardAppointmentModal
                opened={opened}
                onClose={close}
                onSuccess={loadAttendances}
                selectedDate={calendarDate}
                selectedTime={null}
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
