import { Button, Modal, Select, Stack, Textarea, TextInput } from '@mantine/core';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { createAttendance } from '../../../services/attendanceService';
import { getPatients } from '../../../services/patientService';
import type { Patient } from '../../../types/Patient';

type AppointmentFormModalProps = {
    opened: boolean;
    onClose: () => void;
    onSuccess: () => void;
};

export function AppointmentFormModal({ opened, onClose, onSuccess }: AppointmentFormModalProps) {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [patientId, setPatientId] = useState<string | null>(null);
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [type, setType] = useState('Consulta');
    const [professional, setProfessional] = useState('');
    const [summary, setSummary] = useState('');

    useEffect(() => {
        async function loadPatients() {
            const result = await getPatients();

            setPatients(result);
        }

        if (opened) {
            loadPatients();
        }
    }, [opened]);

    async function handleSave() {
        const selectedPatient = patients.find(patient => patient.id === Number(patientId));

        if (!selectedPatient) {
            toast.error('Selecione o paciente.');
            return;
        }

        try {
            await createAttendance({
                patientId: selectedPatient.id,
                patientName: selectedPatient.name,
                date,
                startTime,
                endTime,
                type,
                status: 'Agendado',
                professional,
                summary
            });

            toast.success('Atendimento criado com sucesso.');
            onSuccess();
            onClose();
        } catch {
            toast.error('Erro ao criar atendimento.');
        }
    }

    return (
        <Modal opened={opened} onClose={onClose} title="Novo atendimento" size="lg">
            <Stack>
                <Select
                    label="Paciente"
                    data={patients.map(patient => ({
                        value: String(patient.id),
                        label: patient.name
                    }))}
                    value={patientId}
                    onChange={setPatientId}
                />

                <TextInput label="Data" type="date" value={date} onChange={e => setDate(e.currentTarget.value)} />
                <TextInput label="Horário início" type="time" value={startTime} onChange={e => setStartTime(e.currentTarget.value)} />
                <TextInput label="Horário fim" type="time" value={endTime} onChange={e => setEndTime(e.currentTarget.value)} />
                <TextInput label="Tipo" value={type} onChange={e => setType(e.currentTarget.value)} />
                <TextInput label="Profissional" value={professional} onChange={e => setProfessional(e.currentTarget.value)} />
                <Textarea label="Resumo" value={summary} onChange={e => setSummary(e.currentTarget.value)} />

                <Button onClick={handleSave}>
                    Salvar atendimento
                </Button>
            </Stack>
        </Modal>
    );
}