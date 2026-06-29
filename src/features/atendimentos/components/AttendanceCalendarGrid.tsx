import { ActionIcon, Badge, Button, Card, Group, SegmentedControl, Stack, Text, Title, Tooltip } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import type { Attendance } from '../../../types/Attendance';
import { addDays, formatDateToDisplay, getTodayDateInputValue } from '../../../utils/dateUtils';
import './AttendanceCalendarGrid.css';

type CalendarViewMode = 'day' | 'week';

type AttendanceCalendarGridProps = {
    attendances: Attendance[];
    selectedDate: string;
    onSelectedDateChange: (date: string) => void;
    onComplete: (attendance: Attendance) => void;
    onDelete: (attendance: Attendance) => void;
};

const DEFAULT_START_HOUR = 6;
const DEFAULT_END_HOUR = 19;
const OCCUPIED_HOUR_HEIGHT = 156;
const EMPTY_HOUR_HEIGHT = 40;

function parseDate(date: string) {
    return new Date(`${date}T00:00:00`);
}

function getWeekStart(date: string) {
    const currentDate = parseDate(date);
    const day = currentDate.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;

    currentDate.setDate(currentDate.getDate() + mondayOffset);

    return currentDate.toISOString().split('T')[0];
}

function formatShortDate(date: string) {
    return parseDate(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit'
    });
}

function formatWeekday(date: string) {
    return parseDate(date).toLocaleDateString('pt-BR', {
        weekday: 'short'
    });
}

function timeToMinutes(time: string) {
    const [hours = '0', minutes = '0'] = time.split(':');

    return Number(hours) * 60 + Number(minutes);
}

function getVisibleDates(selectedDate: string, viewMode: CalendarViewMode) {
    if (viewMode === 'day') {
        return [selectedDate];
    }

    const weekStart = getWeekStart(selectedDate);

    return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
}

function getRangeLabel(selectedDate: string, viewMode: CalendarViewMode) {
    if (viewMode === 'day') {
        return formatDateToDisplay(selectedDate);
    }

    const weekStart = getWeekStart(selectedDate);
    const weekEnd = addDays(weekStart, 6);

    return `${formatShortDate(weekStart)} a ${formatShortDate(weekEnd)}`;
}

function getCalendarBounds(attendances: Attendance[], visibleDates: string[]) {
    const visibleAttendances = attendances.filter(attendance => visibleDates.includes(attendance.date));
    const startHours = visibleAttendances
        .map(attendance => timeToMinutes(attendance.startTime))
        .filter(minutes => Number.isFinite(minutes))
        .map(minutes => Math.floor(minutes / 60));
    const endHours = visibleAttendances
        .map(attendance => timeToMinutes(attendance.endTime || attendance.startTime))
        .filter(minutes => Number.isFinite(minutes))
        .map(minutes => Math.ceil(minutes / 60));

    return {
        startHour: Math.min(DEFAULT_START_HOUR, ...startHours),
        endHour: Math.max(DEFAULT_END_HOUR, ...endHours)
    };
}

function attendanceOverlapsHour(attendance: Attendance, hour: number) {
    const startMinutes = timeToMinutes(attendance.startTime);
    const endMinutes = timeToMinutes(attendance.endTime || attendance.startTime);
    const hourStart = hour * 60;
    const hourEnd = hourStart + 60;

    return startMinutes < hourEnd && Math.max(endMinutes, startMinutes + 30) > hourStart;
}

function getSlotTop(slots: { hour: number; height: number }[], hour: number, minutes: number) {
    const previousHeight = slots
        .filter(slot => slot.hour < hour)
        .reduce((total, slot) => total + slot.height, 0);
    const currentSlot = slots.find(slot => slot.hour === hour);

    return previousHeight + ((currentSlot?.height ?? EMPTY_HOUR_HEIGHT) * minutes) / 60;
}

function getEventHeight(slots: { hour: number; height: number }[], startMinutes: number, endMinutes: number) {
    return slots.reduce((height, slot) => {
        const slotStart = slot.hour * 60;
        const slotEnd = slotStart + 60;
        const overlapStart = Math.max(startMinutes, slotStart);
        const overlapEnd = Math.min(endMinutes, slotEnd);

        if (overlapEnd <= overlapStart) {
            return height;
        }

        return height + ((overlapEnd - overlapStart) / 60) * slot.height;
    }, 0);
}

function getStatusColor(attendance: Attendance) {
    if (attendance.status === 'Concluido') {
        return 'green';
    }

    if (attendance.status === 'Cancelado') {
        return 'red';
    }

    return 'blue';
}

function getEventClassName(attendance: Attendance) {
    if (attendance.status === 'Concluido') {
        return 'attendance-calendar__event attendance-calendar__event--completed';
    }

    if (attendance.status === 'Cancelado') {
        return 'attendance-calendar__event attendance-calendar__event--canceled';
    }

    return 'attendance-calendar__event';
}

export function AttendanceCalendarGrid({
    attendances,
    selectedDate,
    onSelectedDateChange,
    onComplete,
    onDelete
}: AttendanceCalendarGridProps) {
    const [viewMode, setViewMode] = useState<CalendarViewMode>('day');
    const today = getTodayDateInputValue();

    const visibleDates = useMemo(() => getVisibleDates(selectedDate, viewMode), [selectedDate, viewMode]);
    const visibleAttendances = useMemo(() => {
        return attendances
            .filter(attendance => visibleDates.includes(attendance.date))
            .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`));
    }, [attendances, visibleDates]);
    const bounds = useMemo(() => getCalendarBounds(attendances, visibleDates), [attendances, visibleDates]);
    const hourCount = bounds.endHour - bounds.startHour;
    const hours = Array.from({ length: hourCount + 1 }, (_, index) => bounds.startHour + index);
    const slots = useMemo(() => {
        return Array.from({ length: hourCount }, (_, index) => {
            const hour = bounds.startHour + index;
            const hasAttendance = visibleAttendances.some(attendance => attendanceOverlapsHour(attendance, hour));

            return {
                hour,
                height: hasAttendance ? OCCUPIED_HOUR_HEIGHT : EMPTY_HOUR_HEIGHT
            };
        });
    }, [bounds.startHour, hourCount, visibleAttendances]);
    const calendarHeight = slots.reduce((total, slot) => total + slot.height, 0);
    const step = viewMode === 'week' ? 7 : 1;

    function navigate(direction: -1 | 1) {
        onSelectedDateChange(addDays(selectedDate, direction * step));
    }

    return (
        <Card withBorder shadow="sm" padding="lg" className="attendance-calendar">
            <Stack>
                <Group justify="space-between" className="attendance-calendar__toolbar">
                    <Group>
                        <Tooltip label={viewMode === 'week' ? 'Semana anterior' : 'Dia anterior'}>
                            <ActionIcon variant="light" size="lg" onClick={() => navigate(-1)} aria-label="Período anterior">
                                <IconChevronLeft size={18} />
                            </ActionIcon>
                        </Tooltip>

                        <div>
                            <Title order={3}>{getRangeLabel(selectedDate, viewMode)}</Title>
                            <Text size="sm" c="dimmed">
                                {visibleAttendances.length} atendimento(s)
                            </Text>
                        </div>

                        <Tooltip label={viewMode === 'week' ? 'Próxima semana' : 'Próximo dia'}>
                            <ActionIcon variant="light" size="lg" onClick={() => navigate(1)} aria-label="Próximo período">
                                <IconChevronRight size={18} />
                            </ActionIcon>
                        </Tooltip>
                    </Group>

                    <Group>
                        <Button variant="light" onClick={() => onSelectedDateChange(today)}>
                            Hoje
                        </Button>

                        <SegmentedControl
                            value={viewMode}
                            onChange={value => setViewMode(value as CalendarViewMode)}
                            data={[
                                { label: 'Dia', value: 'day' },
                                { label: 'Semana', value: 'week' }
                            ]}
                        />
                    </Group>
                </Group>

                <div className="attendance-calendar__scroller">
                    <div
                        className="attendance-calendar__grid"
                        style={{
                            '--calendar-days': visibleDates.length,
                            '--calendar-hours': hourCount,
                            '--calendar-height': `${calendarHeight}px`
                        } as React.CSSProperties}
                    >
                        <div className="attendance-calendar__header">
                            <div className="attendance-calendar__corner" />

                            {visibleDates.map(date => (
                                <div
                                    key={date}
                                    className={
                                        date === today
                                            ? 'attendance-calendar__day-header attendance-calendar__day-header--today'
                                            : 'attendance-calendar__day-header'
                                    }
                                >
                                    <Text fw={700}>{formatWeekday(date)}</Text>
                                    <Text size="sm" c="dimmed">{formatShortDate(date)}</Text>
                                </div>
                            ))}
                        </div>

                        <div className="attendance-calendar__body">
                            <div className="attendance-calendar__times">
                                {hours.map((hour, index) => (
                                    <div
                                        key={hour}
                                        className={
                                            index === 0
                                                ? 'attendance-calendar__time attendance-calendar__time--first'
                                                : 'attendance-calendar__time'
                                        }
                                        style={{
                                            top: index === slots.length
                                                ? `${calendarHeight}px`
                                                : `${getSlotTop(slots, hour, 0)}px`
                                        }}
                                    >
                                        {String(hour).padStart(2, '0')}:00
                                    </div>
                                ))}
                            </div>

                            {visibleDates.map(date => {
                                const dayAttendances = visibleAttendances.filter(attendance => attendance.date === date);

                                return (
                                    <div key={date} className="attendance-calendar__day">
                                        {slots.map(slot => (
                                            <div
                                                key={slot.hour}
                                                className="attendance-calendar__slot"
                                                style={{
                                                    top: getSlotTop(slots, slot.hour, 0),
                                                    height: slot.height
                                                }}
                                            />
                                        ))}

                                        {dayAttendances.map(attendance => {
                                            const startMinutes = timeToMinutes(attendance.startTime);
                                            const endMinutes = timeToMinutes(attendance.endTime || attendance.startTime);
                                            const normalizedEndMinutes = Math.max(endMinutes, startMinutes + 30);
                                            const startHour = Math.floor(startMinutes / 60);
                                            const top = getSlotTop(slots, startHour, startMinutes % 60);
                                            const height = Math.max(getEventHeight(slots, startMinutes, normalizedEndMinutes), 88);
                                            const isCompleted = attendance.status === 'Concluido';

                                            return (
                                                <div
                                                    key={attendance.id}
                                                    className={getEventClassName(attendance)}
                                                    style={{ top, height }}
                                                >
                                                    <Stack gap={4} className="attendance-calendar__event-content">
                                                        <Group justify="space-between" gap={6} wrap="nowrap">
                                                            <Text fw={700} size="sm" className="attendance-calendar__event-title">
                                                                {attendance.patientName}
                                                            </Text>
                                                            <Badge size="xs" color={getStatusColor(attendance)}>
                                                                {attendance.status}
                                                            </Badge>
                                                        </Group>

                                                        <Text size="xs" c="dimmed" className="attendance-calendar__event-meta">
                                                            {attendance.startTime} - {attendance.endTime} | {attendance.type}
                                                        </Text>

                                                        <Text size="xs" className="attendance-calendar__event-meta">
                                                            {attendance.professional || 'Sem profissional'}
                                                        </Text>

                                                        {attendance.summary && (
                                                            <Text size="xs" className="attendance-calendar__event-summary">
                                                                Observação: {attendance.summary}
                                                            </Text>
                                                        )}

                                                        <Group grow gap={6}>
                                                            <Button
                                                                size="compact-xs"
                                                                variant={isCompleted ? 'light' : 'filled'}
                                                                onClick={() => onComplete(attendance)}
                                                            >
                                                                {isCompleted ? 'Editar relatorio' : 'Concluir'}
                                                            </Button>

                                                            <Button
                                                                size="compact-xs"
                                                                variant="light"
                                                                color="red"
                                                                onClick={() => onDelete(attendance)}
                                                            >
                                                                Remover
                                                            </Button>
                                                        </Group>
                                                    </Stack>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {visibleAttendances.length === 0 && (
                    <div className="attendance-calendar__empty">
                        Nenhum atendimento neste período.
                    </div>
                )}
            </Stack>
        </Card>
    );
}
