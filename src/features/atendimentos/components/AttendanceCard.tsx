import { Badge, Button, Card, Group, Stack, Text, Title } from '@mantine/core';
import type { Attendance } from '../../../types/Attendance';

type AttendanceCardProps = {
    attendance: Attendance;
    onComplete?: (attendance: Attendance) => void;
};

export function AttendanceCard({ attendance, onComplete }: AttendanceCardProps) {
    const isCompleted = attendance.status === 'Concluido';

    return (
        <Card withBorder shadow="sm" padding="md">
            <Group justify="space-between" align="flex-start">
                <Stack gap={4}>
                    <Group>
                        <Title order={4}>{attendance.patientName}</Title>
                        <Badge color={isCompleted ? 'green' : 'blue'}>
                            {attendance.status}
                        </Badge>
                    </Group>

                    <Text size="sm" c="dimmed">
                        {attendance.date} - {attendance.startTime} até {attendance.endTime}
                    </Text>

                    <Text size="sm">
                        {attendance.type} | {attendance.professional || 'Sem profissional'}
                    </Text>
                </Stack>

                {onComplete && (
                    <Button variant={isCompleted ? 'light' : 'filled'} onClick={() => onComplete(attendance)}>
                        {isCompleted ? 'Editar relatório' : 'Concluir atendimento'}
                    </Button>
                )}
            </Group>
        </Card>
    );
}