import { Button, Card, Group, Select, SimpleGrid, Stack, TextInput } from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import { PageHeader } from '../../../components/PageHeader/PageHeader';
import { getAttendances } from '../../../services/attendanceService';
import { getPatients } from '../../../services/patientService';
import type { Attendance } from '../../../types/Attendance';
import type { Patient } from '../../../types/Patient';
import { addDays, getTodayDateInputValue } from '../../../utils/dateUtils';
import { ReportCard } from '../components/ReportCard';
import {
    formatDate,
    getDaysSince,
    isDateInRange,
    type ReportColumn
} from '../utils/reportUtils';
import './ReportsPage.css';

type PeriodRow = {
    date: string;
    scheduled: number;
    completed: number;
    canceled: number;
    total: number;
};

type PatientAttendanceRow = {
    patient: string;
    total: number;
    completed: number;
    scheduled: number;
    lastAttendance: string;
    nextAttendance: string;
};

type PatientHistoryRow = {
    patient: string;
    date: string;
    time: string;
    type: string;
    status: string;
    professional: string;
    observation: string;
    report: string;
};

type ScheduleRow = {
    date: string;
    time: string;
    patient: string;
    type: string;
    professional: string;
    status: string;
    observation: string;
};

type PendingRow = {
    date: string;
    time: string;
    patient: string;
    professional: string;
    daysPending: number;
};

type ProfessionalRow = {
    professional: string;
    scheduled: number;
    completed: number;
    canceled: number;
    total: number;
};

type InactivePatientRow = {
    patient: string;
    lastAttendance: string;
    daysSinceLastAttendance: string | number;
    phone: string;
    email: string;
};

const COLORS = ['#228be6', '#40c057', '#fa5252', '#fab005', '#7950f2', '#15aabf'];
const ALL_PATIENTS = 'all';

const reportTitles = {
    'atendimentos-periodo': 'Atendimentos por período',
    'atendimentos-paciente': 'Atendimentos por paciente',
    'relatorio-individual': 'Relatório individual',
    'agenda-periodo': 'Agenda do período',
    'atendimentos-pendentes': 'Atendimentos pendentes',
    'resumo-profissional': 'Resumo por profissional',
    'pacientes-sem-atendimento': 'Pacientes sem atendimento recente'
} as const;

type ReportId = keyof typeof reportTitles;

const periodColumns: ReportColumn<PeriodRow>[] = [
    { key: 'date', label: 'Data' },
    { key: 'scheduled', label: 'Agendados' },
    { key: 'completed', label: 'Concluídos' },
    { key: 'canceled', label: 'Cancelados' },
    { key: 'total', label: 'Total' }
];

const patientAttendanceColumns: ReportColumn<PatientAttendanceRow>[] = [
    { key: 'patient', label: 'Paciente' },
    { key: 'total', label: 'Total' },
    { key: 'completed', label: 'Concluídos' },
    { key: 'scheduled', label: 'Agendados' },
    { key: 'lastAttendance', label: 'Último atendimento' },
    { key: 'nextAttendance', label: 'Próximo atendimento' }
];

const patientHistoryColumns: ReportColumn<PatientHistoryRow>[] = [
    { key: 'patient', label: 'Paciente' },
    { key: 'date', label: 'Data' },
    { key: 'time', label: 'Horário' },
    { key: 'type', label: 'Tipo' },
    { key: 'status', label: 'Status' },
    { key: 'professional', label: 'Profissional' },
    { key: 'observation', label: 'Observação' },
    { key: 'report', label: 'Relatório' }
];

const scheduleColumns: ReportColumn<ScheduleRow>[] = [
    { key: 'date', label: 'Data' },
    { key: 'time', label: 'Horário' },
    { key: 'patient', label: 'Paciente' },
    { key: 'type', label: 'Tipo' },
    { key: 'professional', label: 'Profissional' },
    { key: 'status', label: 'Status' },
    { key: 'observation', label: 'Observação' }
];

const pendingColumns: ReportColumn<PendingRow>[] = [
    { key: 'date', label: 'Data' },
    { key: 'time', label: 'Horário' },
    { key: 'patient', label: 'Paciente' },
    { key: 'professional', label: 'Profissional' },
    { key: 'daysPending', label: 'Dias pendente' }
];

const professionalColumns: ReportColumn<ProfessionalRow>[] = [
    { key: 'professional', label: 'Profissional' },
    { key: 'scheduled', label: 'Agendados' },
    { key: 'completed', label: 'Concluídos' },
    { key: 'canceled', label: 'Cancelados' },
    { key: 'total', label: 'Total' }
];

const inactivePatientColumns: ReportColumn<InactivePatientRow>[] = [
    { key: 'patient', label: 'Paciente' },
    { key: 'lastAttendance', label: 'Último atendimento' },
    { key: 'daysSinceLastAttendance', label: 'Dias sem atendimento' },
    { key: 'phone', label: 'Telefone' },
    { key: 'email', label: 'Email' }
];

function getStatusKey(status: string) {
    if (status === 'Concluido') {
        return 'completed';
    }

    if (status === 'Cancelado') {
        return 'canceled';
    }

    return 'scheduled';
}

function getAttendanceTime(attendance: Attendance) {
    return `${attendance.startTime} - ${attendance.endTime}`;
}

function byAttendanceDate(a: Attendance, b: Attendance) {
    return `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`);
}

function getDateRange(startDate: string, endDate: string) {
    const dates: string[] = [];
    let currentDate = startDate;

    while (currentDate <= endDate) {
        dates.push(currentDate);
        currentDate = addDays(currentDate, 1);
    }

    return dates;
}

export function ReportsPage() {
    const { reportId } = useParams();
    const activeReportId = reportId && reportId in reportTitles ? reportId as ReportId : null;
    const today = getTodayDateInputValue();
    const defaultStartDate = addDays(today, -30);
    const [startDate, setStartDate] = useState(addDays(today, -30));
    const [endDate, setEndDate] = useState(today);
    const [selectedPatientId, setSelectedPatientId] = useState(ALL_PATIENTS);
    const [draftStartDate, setDraftStartDate] = useState(defaultStartDate);
    const [draftEndDate, setDraftEndDate] = useState(today);
    const [draftPatientId, setDraftPatientId] = useState(ALL_PATIENTS);
    const [attendances, setAttendances] = useState<Attendance[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);

    const patientOptions = useMemo(() => {
        return [
            { value: ALL_PATIENTS, label: 'Todos os pacientes' },
            ...patients.map(patient => ({
                value: String(patient.id),
                label: patient.name
            }))
        ];
    }, [patients]);

    const filteredAttendances = useMemo(() => {
        return attendances
            .filter(attendance => isDateInRange(attendance.date, startDate, endDate))
            .filter(attendance =>
                selectedPatientId === ALL_PATIENTS
                || attendance.patientId === Number(selectedPatientId)
            )
            .sort(byAttendanceDate);
    }, [attendances, selectedPatientId, startDate, endDate]);

    const selectedPatientAttendances = useMemo(() => {
        if (selectedPatientId === ALL_PATIENTS) {
            return filteredAttendances;
        }

        return filteredAttendances
            .filter(attendance => attendance.patientId === Number(selectedPatientId))
            .sort(byAttendanceDate);
    }, [filteredAttendances, selectedPatientId]);

    const periodRows = useMemo<PeriodRow[]>(() => {
        return getDateRange(startDate, endDate).map(date => {
            const dayAttendances = filteredAttendances.filter(attendance => attendance.date === date);

            return {
                date: formatDate(date),
                scheduled: dayAttendances.filter(attendance => getStatusKey(attendance.status) === 'scheduled').length,
                completed: dayAttendances.filter(attendance => getStatusKey(attendance.status) === 'completed').length,
                canceled: dayAttendances.filter(attendance => getStatusKey(attendance.status) === 'canceled').length,
                total: dayAttendances.length
            };
        });
    }, [filteredAttendances, startDate, endDate]);

    const patientAttendanceRows = useMemo<PatientAttendanceRow[]>(() => {
        return patients
            .filter(patient =>
                selectedPatientId === ALL_PATIENTS
                || patient.id === Number(selectedPatientId)
            )
            .map(patient => {
                const patientAttendances = attendances
                .filter(attendance => attendance.patientId === patient.id)
                .sort(byAttendanceDate);
                const pastAttendances = patientAttendances.filter(attendance => attendance.date <= today);
                const futureAttendances = patientAttendances.filter(attendance => attendance.date >= today);
                const lastAttendance = pastAttendances.at(-1);
                const nextAttendance = futureAttendances[0];

                return {
                    patient: patient.name,
                    total: patientAttendances.length,
                    completed: patientAttendances.filter(attendance => attendance.status === 'Concluido').length,
                    scheduled: patientAttendances.filter(attendance => attendance.status === 'Agendado').length,
                    lastAttendance: lastAttendance ? formatDate(lastAttendance.date) : '',
                    nextAttendance: nextAttendance ? `${formatDate(nextAttendance.date)} ${nextAttendance.startTime}` : ''
                };
            }).sort((a, b) => b.total - a.total);
    }, [attendances, patients, selectedPatientId, today]);

    const patientHistoryRows = useMemo<PatientHistoryRow[]>(() => {
        return selectedPatientAttendances.map(attendance => ({
            patient: attendance.patientName,
            date: formatDate(attendance.date),
            time: getAttendanceTime(attendance),
            type: attendance.type,
            status: attendance.status,
            professional: attendance.professional || 'Sem profissional',
            observation: attendance.summary ?? '',
            report: attendance.report ?? ''
        }));
    }, [selectedPatientAttendances]);

    const scheduleRows = useMemo<ScheduleRow[]>(() => {
        return filteredAttendances.map(attendance => ({
            date: formatDate(attendance.date),
            time: getAttendanceTime(attendance),
            patient: attendance.patientName,
            type: attendance.type,
            professional: attendance.professional || 'Sem profissional',
            status: attendance.status,
            observation: attendance.summary ?? ''
        }));
    }, [filteredAttendances]);

    const pendingRows = useMemo<PendingRow[]>(() => {
        return attendances
            .filter(attendance => attendance.status === 'Agendado' && attendance.date < today)
            .filter(attendance =>
                selectedPatientId === ALL_PATIENTS
                || attendance.patientId === Number(selectedPatientId)
            )
            .sort(byAttendanceDate)
            .map(attendance => ({
                date: formatDate(attendance.date),
                time: getAttendanceTime(attendance),
                patient: attendance.patientName,
                professional: attendance.professional || 'Sem profissional',
                daysPending: getDaysSince(attendance.date) ?? 0
            }));
    }, [attendances, selectedPatientId, today]);

    const professionalRows = useMemo<ProfessionalRow[]>(() => {
        const professionalMap = new Map<string, ProfessionalRow>();

        filteredAttendances.forEach(attendance => {
            const professional = attendance.professional || 'Sem profissional';
            const current = professionalMap.get(professional) ?? {
                professional,
                scheduled: 0,
                completed: 0,
                canceled: 0,
                total: 0
            };

            current[getStatusKey(attendance.status)] += 1;
            current.total += 1;
            professionalMap.set(professional, current);
        });

        return Array.from(professionalMap.values()).sort((a, b) => b.total - a.total);
    }, [filteredAttendances]);

    const inactivePatientRows = useMemo<InactivePatientRow[]>(() => {
        const attendedPatientIds = new Set(filteredAttendances.map(attendance => attendance.patientId));

        return patients
            .filter(patient =>
                selectedPatientId === ALL_PATIENTS
                || patient.id === Number(selectedPatientId)
            )
            .map(patient => {
                const patientAttendances = attendances
                    .filter(attendance => attendance.patientId === patient.id && attendance.date <= today)
                    .sort(byAttendanceDate);
                const lastAttendance = patientAttendances.at(-1);
                const daysSinceLastAttendance = lastAttendance ? getDaysSince(lastAttendance.date) : null;

                return {
                    patient: patient.name,
                    lastAttendance: lastAttendance ? formatDate(lastAttendance.date) : '',
                    daysSinceLastAttendance: daysSinceLastAttendance ?? 'Nunca atendido',
                    phone: patient.phone ?? '',
                    email: patient.email ?? ''
                };
            })
            .filter(row => {
                const patient = patients.find(item => item.name === row.patient);

                return patient ? !attendedPatientIds.has(patient.id) : false;
            })
            .sort((a, b) => Number(b.daysSinceLastAttendance) - Number(a.daysSinceLastAttendance));
    }, [attendances, filteredAttendances, patients, selectedPatientId, today]);

    const statusChartRows = [
        { name: 'Agendados', value: filteredAttendances.filter(item => item.status === 'Agendado').length },
        { name: 'Concluídos', value: filteredAttendances.filter(item => item.status === 'Concluido').length },
        { name: 'Cancelados', value: filteredAttendances.filter(item => item.status === 'Cancelado').length }
    ].filter(item => item.value > 0);

    useEffect(() => {
        async function loadData() {
            const [attendanceResult, patientResult] = await Promise.all([
                getAttendances(),
                getPatients()
            ]);

            setAttendances(attendanceResult);
            setPatients(patientResult);
        }

        loadData();
    }, []);

    function handleFilter() {
        setStartDate(draftStartDate);
        setEndDate(draftEndDate);
        setSelectedPatientId(draftPatientId);
    }

    function handleClearFilters() {
        setDraftStartDate(defaultStartDate);
        setDraftEndDate(today);
        setDraftPatientId(ALL_PATIENTS);
        setStartDate(defaultStartDate);
        setEndDate(today);
        setSelectedPatientId(ALL_PATIENTS);
    }

    function shouldShow(report: ReportId) {
        return !activeReportId || activeReportId === report;
    }

    return (
        <>
            <PageHeader title={activeReportId ? reportTitles[activeReportId] : 'Relatórios'} />

            <Stack>
                <Card withBorder shadow="sm" padding="lg">
                    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
                        <TextInput
                            label="Data inicial"
                            type="date"
                            value={draftStartDate}
                            onChange={event => setDraftStartDate(event.currentTarget.value)}
                        />

                        <TextInput
                            label="Data final"
                            type="date"
                            value={draftEndDate}
                            onChange={event => setDraftEndDate(event.currentTarget.value)}
                        />

                        <Select
                            label="Paciente"
                            searchable
                            data={patientOptions}
                            value={draftPatientId}
                            onChange={value => setDraftPatientId(value ?? ALL_PATIENTS)}
                        />

                    </SimpleGrid>

                    <Group justify="flex-end" mt="md">
                        <Button variant="light" onClick={handleClearFilters}>
                            Limpar filtros
                        </Button>

                        <Button onClick={handleFilter}>
                            Filtrar
                        </Button>
                    </Group>
                </Card>

                {shouldShow('atendimentos-periodo') && (
                    <ReportCard
                        title="Atendimentos por período"
                        description="Volume diário separado por status dentro do período selecionado."
                        fileName="atendimentos-por-periodo.csv"
                        columns={periodColumns}
                        rows={periodRows}
                    >
                        <div className="reports-chart">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={periodRows}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Bar dataKey="scheduled" name="Agendados" fill="#228be6" />
                                    <Bar dataKey="completed" name="Concluídos" fill="#40c057" />
                                    <Bar dataKey="canceled" name="Cancelados" fill="#fa5252" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </ReportCard>
                )}

                {shouldShow('atendimentos-paciente') && (
                    <ReportCard
                        title="Atendimentos por paciente"
                        description="Frequência de atendimentos, último atendimento e próximo agendamento."
                        fileName="atendimentos-por-paciente.csv"
                        columns={patientAttendanceColumns}
                        rows={patientAttendanceRows}
                    >
                        <div className="reports-chart--small">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={patientAttendanceRows.slice(0, 8)}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="patient" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Bar dataKey="total" name="Atendimentos" fill="#228be6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </ReportCard>
                )}

                {shouldShow('relatorio-individual') && (
                    <ReportCard
                        title="Relatório individual do paciente"
                        description={
                            selectedPatientId === ALL_PATIENTS
                                ? 'Histórico completo de todos os pacientes no período selecionado.'
                                : `Histórico completo de ${patients.find(patient => String(patient.id) === selectedPatientId)?.name ?? 'paciente selecionado'}.`
                        }
                        fileName="relatorio-individual-paciente.csv"
                        columns={patientHistoryColumns}
                        rows={patientHistoryRows}
                    />
                )}

                {shouldShow('agenda-periodo') && (
                    <ReportCard
                        title="Agenda do período"
                        description="Lista cronológica de atendimentos com paciente, horário, status e observação."
                        fileName="agenda-do-periodo.csv"
                        columns={scheduleColumns}
                        rows={scheduleRows}
                    >
                        <Group gap="lg">
                            {statusChartRows.length > 0 && (
                                <div className="reports-chart--small" style={{ width: '100%' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={statusChartRows}
                                                dataKey="value"
                                                nameKey="name"
                                                outerRadius={82}
                                                label
                                            >
                                                {statusChartRows.map((entry, index) => (
                                                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </Group>
                    </ReportCard>
                )}

                {shouldShow('atendimentos-pendentes') && (
                    <ReportCard
                        title="Atendimentos pendentes"
                        description="Atendimentos passados que ainda estão como agendados."
                        fileName="atendimentos-pendentes.csv"
                        columns={pendingColumns}
                        rows={pendingRows}
                    />
                )}

                {shouldShow('resumo-profissional') && (
                    <ReportCard
                        title="Resumo por profissional"
                        description="Distribuição de atendimentos por profissional no período selecionado."
                        fileName="resumo-por-profissional.csv"
                        columns={professionalColumns}
                        rows={professionalRows}
                    >
                        <div className="reports-chart--small">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={professionalRows}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="professional" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Bar dataKey="total" name="Total" fill="#15aabf" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </ReportCard>
                )}

                {shouldShow('pacientes-sem-atendimento') && (
                    <ReportCard
                        title="Pacientes sem atendimento recente"
                        description="Pacientes sem atendimento dentro do período filtrado."
                        fileName="pacientes-sem-atendimento-recente.csv"
                        columns={inactivePatientColumns}
                        rows={inactivePatientRows}
                    />
                )}
            </Stack>
        </>
    );
}
