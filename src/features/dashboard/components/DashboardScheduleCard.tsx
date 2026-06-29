import { Badge, Card, Group, Stack, Text, Title } from '@mantine/core';
import type { Attendance } from '../../../types/Attendance';

type DashboardScheduleCardProps = {
    attendance: Attendance;
};

export function DashboardScheduleCard({ attendance }: DashboardScheduleCardProps) {
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
                    <Text size="sm">
                        {attendance.summary}
                    </Text>
                )}
            </Stack>
        </Card>
    );
}