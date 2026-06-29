import { NavLink, Stack } from '@mantine/core';
import { IconCalendar, IconChartBar, IconDashboard, IconUsers } from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router';

const reportLinks = [
    { label: 'Atendimentos por período', path: '/relatorios/atendimentos-periodo' },
    { label: 'Atendimentos por paciente', path: '/relatorios/atendimentos-paciente' },
    { label: 'Relatório individual', path: '/relatorios/relatorio-individual' },
    { label: 'Agenda do período', path: '/relatorios/agenda-periodo' },
    { label: 'Atendimentos pendentes', path: '/relatorios/atendimentos-pendentes' },
    { label: 'Resumo por profissional', path: '/relatorios/resumo-profissional' },
    { label: 'Pacientes sem atendimento', path: '/relatorios/pacientes-sem-atendimento' }
];

export function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

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

            <NavLink
                label="Relatórios"
                leftSection={<IconChartBar size={18} />}
                active={location.pathname.startsWith('/relatorios')}
                defaultOpened={location.pathname.startsWith('/relatorios')}
            >
                {reportLinks.map(report => (
                    <NavLink
                        key={report.path}
                        label={report.label}
                        active={location.pathname === report.path}
                        onClick={() => navigate(report.path)}
                    />
                ))}
            </NavLink>
        </Stack>
    );
}
