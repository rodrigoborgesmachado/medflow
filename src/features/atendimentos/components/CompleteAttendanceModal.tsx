import { Button, Group, Modal, Stack, Text, Textarea } from '@mantine/core';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { completeAttendance } from '../../../services/attendanceService';
import type { Attendance } from '../../../types/Attendance';

type CompleteAttendanceModalProps = {
    opened: boolean;
    attendance: Attendance | null;
    onClose: () => void;
    onSuccess: () => void;
};

const defaultReport = `Encontro paciente sentada em BEG, AAA, colaborativa e comunicativa, sem queixas álgicas.

Sinais vitais:
SpO2:
FC:
PA:

Condutas:
-

Finalizo sem intercorrências.`;

export function CompleteAttendanceModal({
    opened,
    attendance,
    onClose,
    onSuccess
}: CompleteAttendanceModalProps) {
    const [report, setReport] = useState(defaultReport);

    useEffect(() => {
        if (!attendance) {
            setReport(defaultReport);
            return;
        }

        setReport(attendance.report?.trim() ? attendance.report : defaultReport);

    }, [attendance]);

    async function handleSave() {
        if (!attendance) {
            return;
        }

        if (!report.trim()) {
            toast.error('Informe o relatório do atendimento.');
            return;
        }

        try {
            await completeAttendance(attendance, report);

            toast.success('Relatório salvo com sucesso.');
            onSuccess();
            onClose();
        } catch {
            toast.error('Erro ao salvar relatório.');
        }
    }

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Concluir atendimento"
            size="80%"
            centered
            styles={{
                content: {
                    height: '90vh'
                },
                body: {
                    height: 'calc(90vh - 70px)',
                    display: 'flex',
                    flexDirection: 'column'
                }
            }}
        >
            <Stack style={{ flex: 1, minHeight: 0 }}>
                {attendance && (
                    <Text c="dimmed">
                        {attendance.patientName} - {attendance.date} às {attendance.startTime}
                    </Text>
                )}

                <Textarea
                    label="Relatório do atendimento"
                    autosize={false}
                    minRows={20}
                    value={report}
                    onChange={event => setReport(event.currentTarget.value)}
                    styles={{
                        root: {
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            minHeight: 0
                        },
                        wrapper: {
                            flex: 1
                        },
                        input: {
                            height: '100%',
                            minHeight: '55vh',
                            resize: 'none',
                            fontSize: 16,
                            lineHeight: 1.6
                        }
                    }}
                />

                <Group justify="flex-end">
                    <Button variant="light" onClick={onClose}>
                        Cancelar
                    </Button>

                    <Button onClick={handleSave}>
                        Salvar relatório
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}