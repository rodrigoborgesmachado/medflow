import { Badge, Button, Card, Group, Stack, Text, Title, Spoiler } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { Attendance } from '../../../types/Attendance';

type PatientAttendanceCardProps = {
    attendance: Attendance;
    onEditReport: (attendance: Attendance) => void;
};

export function PatientAttendanceCard({
    attendance,
    onEditReport
}: PatientAttendanceCardProps) {
    const [opened, { toggle }] = useDisclosure(false);
    const isCompleted = attendance.status === 'Concluido';

    return (
        <Card withBorder shadow="xs" padding="md">
            <Group justify="space-between" align="flex-start">
                <Stack gap={4}>
                    <Group>
                        <Title order={4}>{attendance.date} - {attendance.startTime}</Title>

                        <Badge color={isCompleted ? 'green' : 'blue'}>
                            {attendance.status}
                        </Badge>
                    </Group>

                    <Text size="sm" c="dimmed">
                        {attendance.type} | {attendance.professional || 'Sem profissional'}
                    </Text>
                </Stack>

                <Group>
                    <Button variant="light" onClick={toggle}>
                        {opened ? 'Ocultar relatório' : 'Ver relatório'}
                    </Button>

                    <Button onClick={() => onEditReport(attendance)}>
                        {isCompleted ? 'Editar relatório' : 'Concluir atendimento'}
                    </Button>
                </Group>
            </Group>

            {opened && (
                <Card mt="md" padding="md" radius="md" withBorder>
                    <Title order={5} mb="sm">
                        Relatório
                    </Title>

                    {attendance.report?.trim() ? (
                        <Spoiler maxHeight={250} showLabel="Mostrar mais" hideLabel="Mostrar menos">
                            <Text style={{ whiteSpace: 'pre-line' }}>
                                {attendance.report}
                            </Text>
                        </Spoiler>
                    ) : (
                        <Text c="dimmed">
                            Este atendimento ainda não possui relatório.
                        </Text>
                    )}
                </Card>
            )}
        </Card>
    );
}