import { NavLink, Stack } from '@mantine/core';
import { IconCalendar, IconDashboard, IconUsers } from '@tabler/icons-react';
import { useNavigate } from 'react-router';

export function Sidebar() {
    const navigate = useNavigate();

    return (
        <Stack>
            <NavLink
                label="Dashboard"
                leftSection={<IconDashboard size={18} />}
                onClick={() => navigate('/dashboard')}
            />

            <NavLink
                label="Pacientes"
                leftSection={<IconUsers size={18} />}
                onClick={() => navigate('/pacientes')}
            />

            <NavLink
                label="Atendimentos"
                leftSection={<IconCalendar size={18} />}
                onClick={() => navigate('/atendimentos')}
            />
        </Stack>
    );
}