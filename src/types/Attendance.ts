export type AttendanceStatus = 'Agendado' | 'Concluido' | 'Cancelado';

export type Attendance = {
    id: number;
    folderName: string;
    patientId: number;
    patientName: string;
    date: string;
    startTime: string;
    endTime: string;
    type: string;
    status: AttendanceStatus | string;
    professional: string;
    summary?: string;
    completedAt?: string;
    report?: string;
};