import { Button, Modal, Stack, Textarea, TextInput } from '@mantine/core';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { createPatient } from '../../../services/patientService';

type PatientFormModalProps = {
    opened: boolean;
    onClose: () => void;
    onSuccess: () => void;
};

export function PatientFormModal({ opened, onClose, onSuccess }: PatientFormModalProps) {
    const [name, setName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [document, setDocument] = useState('');
    const [profession, setProfession] = useState('');
    const [address, setAddress] = useState('');
    const [observations, setObservations] = useState('');

    async function handleSave() {
        if (!name.trim()) {
            toast.error('Informe o nome do paciente.');
            return;
        }

        try {
            await createPatient({
                name,
                birthDate,
                phone,
                email,
                document,
                profession,
                address,
                observations
            });

            toast.success('Paciente cadastrado com sucesso.');
            onSuccess();
            onClose();
        } catch {
            toast.error('Erro ao cadastrar paciente.');
        }
    }

    return (
        <Modal opened={opened} onClose={onClose} title="Cadastrar paciente" size="lg">
            <Stack>
                <TextInput label="Nome" value={name} onChange={e => setName(e.currentTarget.value)} />
                <TextInput label="Data de nascimento" type="date" value={birthDate} onChange={e => setBirthDate(e.currentTarget.value)} />
                <TextInput label="Telefone" value={phone} onChange={e => setPhone(e.currentTarget.value)} />
                <TextInput label="Email" value={email} onChange={e => setEmail(e.currentTarget.value)} />
                <TextInput label="Documento" value={document} onChange={e => setDocument(e.currentTarget.value)} />
                <TextInput label="Profissão" value={profession} onChange={e => setProfession(e.currentTarget.value)} />
                <TextInput label="Endereço" value={address} onChange={e => setAddress(e.currentTarget.value)} />
                <Textarea label="Observações" value={observations} onChange={e => setObservations(e.currentTarget.value)} />

                <Button onClick={handleSave}>
                    Salvar paciente
                </Button>
            </Stack>
        </Modal>
    );
}