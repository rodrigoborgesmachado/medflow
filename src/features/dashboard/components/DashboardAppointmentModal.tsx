import {
    Button,
    Divider,
    Group,
    Modal,
    Select,
    Stack,
    Text,
    Textarea,
    TextInput
} from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { createAttendance } from '../../../services/attendanceService';
import { createPatient, getPatients } from '../../../services/patientService';
import type { Patient } from '../../../types/Patient';
import { getProfessionalName } from '../../../services/fileSystemService';

type DashboardAppointmentModalProps = {
    opened: boolean;
    onClose: () => void;
    onSuccess: () => void;
    selectedDate: string;
    selectedTime: string | null;
};

export function DashboardAppointmentModal({
    opened,
    onClose,
    onSuccess,
    selectedDate,
    selectedTime
}: DashboardAppointmentModalProps) {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [patientId, setPatientId] = useState<string | null>(null);
    const [isCreatingPatient, setIsCreatingPatient] = useState(false);

    const [newPatientName, setNewPatientName] = useState('');
    const [newPatientPhone, setNewPatientPhone] = useState('');
    const [newPatientEmail, setNewPatientEmail] = useState('');

    const [date, setDate] = useState(selectedDate);
    const [startTime, setStartTime] = useState(selectedTime ?? '');
    const [endTime, setEndTime] = useState('');
    const [type, setType] = useState('Consulta');
    const [professional, setProfessional] = useState('');
    const [summary, setSummary] = useState('');

    const patientOptions = useMemo(() => {
        return patients.map(patient => ({
            value: String(patient.id),
            label: patient.name
        }));
    }, [patients]);

    async function loadPatients() {
        const result = await getPatients();

        setPatients(result);
    }

    function calculateEndTime(start: string) {
        if (!start) {
            return '';
        }

        const [hours, minutes] = start.split(':').map(Number);
        const dateValue = new Date();

        dateValue.setHours(hours);
        dateValue.setMinutes(minutes);
        dateValue.setHours(dateValue.getHours() + 1);

        return dateValue.toTimeString().slice(0, 5);
    }

    async function handleCreatePatient() {
        if (!newPatientName.trim()) {
            toast.error('Informe o nome do paciente.');
            return null;
        }

        const createdPatientId = await createPatient({
            name: newPatientName,
            phone: newPatientPhone,
            email: newPatientEmail,
            birthDate: '',
            document: '',
            profession: '',
            address: '',
            observations: ''
        });

        await loadPatients();

        setPatientId(String(createdPatientId));
        setIsCreatingPatient(false);
        toast.success('Paciente criado e selecionado.');

        return createdPatientId;
    }

    async function handleSave() {
        try {
            let selectedPatient = patients.find(patient => patient.id === Number(patientId));

            if (isCreatingPatient) {
                const createdPatientId = await handleCreatePatient();

                selectedPatient = patients.find(patient => patient.id === createdPatientId);

                if (!selectedPatient) {
                    const reloadedPatients = await getPatients();
                    selectedPatient = reloadedPatients.find(patient => patient.id === createdPatientId);
                }
            }

            if (!selectedPatient) {
                toast.error('Selecione ou cadastre um paciente.');
                return;
            }

            if (!date || !startTime || !endTime) {
                toast.error('Informe data, horário inicial e horário final.');
                return;
            }

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

            toast.success('Horário adicionado com sucesso.');
            onSuccess();
            onClose();
        } catch {
            toast.error('Erro ao adicionar horário.');
        }
    }

    useEffect(() => {
        if (!opened) {
            return;
        }

        loadPatients();
        setDate(selectedDate);
        setStartTime(selectedTime ?? '');
        setEndTime(calculateEndTime(selectedTime ?? ''));

        getProfessionalName().then(result => setProfessional(result));
    }, [opened, selectedDate, selectedTime]);

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Adicionar horário"
            size="lg"
            centered
        >
            <Stack>
                <Group grow>
                    <TextInput
                        label="Data"
                        type="date"
                        value={date}
                        onChange={event => setDate(event.currentTarget.value)}
                    />

                    <TextInput
                        label="Horário inicial"
                        type="time"
                        value={startTime}
                        onChange={event => {
                            const value = event.currentTarget.value;

                            setStartTime(value);
                            setEndTime(calculateEndTime(value));
                        }}
                    />

                    <TextInput
                        label="Horário final"
                        type="time"
                        value={endTime}
                        onChange={event => setEndTime(event.currentTarget.value)}
                    />
                </Group>

                <Divider label="Paciente" labelPosition="center" />

                {!isCreatingPatient ? (
                    <>
                        <Select
                            label="Paciente"
                            placeholder="Selecione o paciente"
                            searchable
                            data={patientOptions}
                            value={patientId}
                            onChange={setPatientId}
                        />

                        <Button variant="light" onClick={() => setIsCreatingPatient(true)}>
                            Cadastrar novo paciente
                        </Button>
                    </>
                ) : (
                    <Stack>
                        <Text fw={700}>Novo paciente</Text>

                        <TextInput
                            label="Nome"
                            value={newPatientName}
                            onChange={event => setNewPatientName(event.currentTarget.value)}
                        />

                        <TextInput
                            label="Telefone"
                            value={newPatientPhone}
                            onChange={event => setNewPatientPhone(event.currentTarget.value)}
                        />

                        <TextInput
                            label="Email"
                            value={newPatientEmail}
                            onChange={event => setNewPatientEmail(event.currentTarget.value)}
                        />

                        <Group>
                            <Button variant="light" onClick={() => setIsCreatingPatient(false)}>
                                Voltar para seleção
                            </Button>

                            <Button variant="light" onClick={handleCreatePatient}>
                                Criar paciente
                            </Button>
                        </Group>
                    </Stack>
                )}

                <Divider label="Atendimento" labelPosition="center" />

                <Group grow>
                    <TextInput
                        label="Tipo"
                        value={type}
                        onChange={event => setType(event.currentTarget.value)}
                    />

                    <TextInput
                        label="Profissional"
                        value={professional}
                        onChange={event => setProfessional(event.currentTarget.value)}
                        disabled
                    />
                </Group>

                <Textarea
                    label="Observação"
                    value={summary}
                    onChange={event => setSummary(event.currentTarget.value)}
                />

                <Group justify="flex-end">
                    <Button variant="light" onClick={onClose}>
                        Cancelar
                    </Button>

                    <Button onClick={handleSave}>
                        Salvar horário
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}