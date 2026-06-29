import { Badge, Button, Card, Group, Stack, Text, Title } from '@mantine/core';
import type { Attendance } from '../../../types/Attendance';

type DashboardScheduleCardProps = {
    attendance: Attendance;
    onComplete?: (attendance: Attendance) => void;
    onDelete?: (attendance: Attendance) => void;
};

export function DashboardScheduleCard({ attendance, onComplete, onDelete }: DashboardScheduleCardProps) {
    const isCompleted = attendance.status === 'Concluido';

    return (
        <Card withBorder shadow="sm" padding="md">
            <Stack gap={4}>
                <Group justify="space-between">
                    <Title order={4}>
                        {attendance.startTime} - {attendance.endTime}
                    </Title>

                    <Badge color={isCompleted ? 'green' : 'blue'}>
                        {attendance.status}
                    </Badge>
                </Group>

                <Text fw={700}>{attendance.patientName}</Text>

                <Text size="sm" c="dimmed">
                    {attendance.type} | {attendance.professional || 'Sem profissional'}
                </Text>

                {attendance.summary && (
                    <Text size="sm" c="dimmed">
                        <Text span fw={700} c="dark">Observação: </Text>
                        {attendance.summary}
                    </Text>
                )}

                {(onComplete || onDelete) && (
                    <Group grow mt="xs">
                        {onComplete && (
                            <Button
                                variant={isCompleted ? 'light' : 'filled'}
                                onClick={() => onComplete(attendance)}
                            >
                                {isCompleted ? 'Editar relatorio' : 'Concluir consulta'}
                            </Button>
                        )}

                        {onDelete && (
                            <Button
                                variant="light"
                                color="red"
                                onClick={() => onDelete(attendance)}
                            >
                                Remover horário
                            </Button>
                        )}
                    </Group>
                )}
            </Stack>
        </Card>
    );
}
