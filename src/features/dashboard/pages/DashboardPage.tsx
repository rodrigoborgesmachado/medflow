import { Badge, Button, Card, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '../../../components/PageHeader/PageHeader';
import { getAttendances } from '../../../services/attendanceService';
import type { Attendance } from '../../../types/Attendance';
import { addDays, formatDateToDisplay, getTodayDateInputValue } from '../../../utils/dateUtils';
import { CompleteAttendanceModal } from '../../atendimentos/components/CompleteAttendanceModal';
import { DashboardAppointmentModal } from '../components/DashboardAppointmentModal';
import { DashboardScheduleCard } from '../components/DashboardScheduleCard';

const QUICK_TIMES = [
    '07:00',
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00'
];

export function DashboardPage() {
    const [selectedDate, setSelectedDate] = useState(getTodayDateInputValue());
    const [attendances, setAttendances] = useState<Attendance[]>([]);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
    const [opened, handlers] = useDisclosure(false);
    const [completeOpened, completeHandlers] = useDisclosure(false);

    const dayAttendances = useMemo(() => {
        return attendances
            .filter(attendance => attendance.date === selectedDate)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
    }, [attendances, selectedDate]);

    const completedCount = dayAttendances.filter(item => item.status === 'Concluido').length;
    const scheduledCount = dayAttendances.filter(item => item.status === 'Agendado').length;
    const occupiedTimes = dayAttendances.map(item => item.startTime);

    async function loadAttendances() {
        const result = await getAttendances();

        setAttendances(result);
    }

    function handleAddAttendance(time?: string) {
        setSelectedTime(time ?? null);
        handlers.open();
    }

    function handleComplete(attendance: Attendance) {
        setSelectedAttendance(attendance);
        completeHandlers.open();
    }

    function isTimeOccupied(time: string) {
        return occupiedTimes.includes(time);
    }

    useEffect(() => {
        loadAttendances();
    }, []);

    return (
        <>
            <PageHeader title="Dashboard">
                <Button onClick={() => handleAddAttendance()}>
                    Novo horário
                </Button>
            </PageHeader>

            <Stack>
                <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
                    <Card withBorder shadow="sm" padding="lg">
                        <Text c="dimmed" size="sm">Atendimentos do dia</Text>
                        <Title order={2}>{dayAttendances.length}</Title>
                    </Card>

                    <Card withBorder shadow="sm" padding="lg">
                        <Text c="dimmed" size="sm">Agendados</Text>
                        <Title order={2}>{scheduledCount}</Title>
                    </Card>

                    <Card withBorder shadow="sm" padding="lg">
                        <Text c="dimmed" size="sm">Concluídos</Text>
                        <Title order={2}>{completedCount}</Title>
                    </Card>

                    <Card withBorder shadow="sm" padding="lg">
                        <Text c="dimmed" size="sm">Horários livres</Text>
                        <Title order={2}>{QUICK_TIMES.length - occupiedTimes.length}</Title>
                    </Card>
                </SimpleGrid>

                <Card withBorder shadow="sm" padding="lg">
                    <Group justify="space-between">
                        <Button variant="light" onClick={() => setSelectedDate(addDays(selectedDate, -1))}>
                            Dia anterior
                        </Button>

                        <div style={{ textAlign: 'center' }}>
                            <Title order={3}>{formatDateToDisplay(selectedDate)}</Title>
                            <Text c="dimmed">
                                {dayAttendances.length} atendimento(s) no dia
                            </Text>
                        </div>

                        <Button variant="light" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
                            Próximo dia
                        </Button>
                    </Group>
                </Card>

                <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }}>
                    {dayAttendances.map(attendance => (
                        <DashboardScheduleCard
                            key={attendance.id}
                            attendance={attendance}
                            onComplete={handleComplete}
                        />
                    ))}

                    {dayAttendances.length === 0 && (
                        <Card withBorder shadow="sm" padding="lg">
                            <Text c="dimmed">
                                Nenhum atendimento para este dia.
                            </Text>
                        </Card>
                    )}
                </SimpleGrid>

                <Card withBorder shadow="sm" padding="lg">
                    <Group justify="space-between" mb="md">
                        <Title order={3}>Adicionar horário rápido</Title>
                        <Text c="dimmed">Horários ocupados aparecem bloqueados</Text>
                    </Group>

                    <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 6 }}>
                        {QUICK_TIMES.map(time => {
                            const occupied = isTimeOccupied(time);

                            return (
                                <Button
                                    key={time}
                                    variant={occupied ? 'filled' : 'light'}
                                    color={occupied ? 'gray' : 'blue'}
                                    disabled={occupied}
                                    onClick={() => handleAddAttendance(time)}
                                    rightSection={occupied ? <Badge size="xs">Ocupado</Badge> : undefined}
                                >
                                    {time}
                                </Button>
                            );
                        })}
                    </SimpleGrid>
                </Card>
            </Stack>

            <DashboardAppointmentModal
                opened={opened}
                onClose={handlers.close}
                onSuccess={loadAttendances}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
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
