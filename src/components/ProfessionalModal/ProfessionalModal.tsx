import { Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getProfessionalName, updateProfessionalName } from '../../services/fileSystemService';

type ProfessionalModalProps = {
    opened: boolean;
    onClose: () => void;
    onSuccess: () => void;
};

export function ProfessionalModal({
    opened,
    onClose,
    onSuccess
}: ProfessionalModalProps) {
    const [professionalName, setProfessionalName] = useState('');

    useEffect(() => {
        async function loadProfessionalName() {
            const result = await getProfessionalName();

            setProfessionalName(result);
        }

        if (opened) {
            loadProfessionalName();
        }
    }, [opened]);

    async function handleSave() {
        try {
            await updateProfessionalName(professionalName);

            toast.success('Profissional atualizado com sucesso.');
            onSuccess();
            onClose();
        } catch {
            toast.error('Erro ao atualizar profissional.');
        }
    }

    return (
        <Modal opened={opened} onClose={onClose} title="Profissional" centered>
            <Stack>
                <TextInput
                    label="Nome do profissional"
                    value={professionalName}
                    onChange={event => setProfessionalName(event.currentTarget.value)}
                />

                <Group justify="flex-end">
                    <Button variant="light" onClick={onClose}>
                        Cancelar
                    </Button>

                    <Button onClick={handleSave}>
                        Salvar
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}