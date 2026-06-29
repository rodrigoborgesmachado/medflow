import type { Attendance } from '../types/Attendance';
import {
    createFile,
    getDirectory,
    getNextIncrementalDirectoryName,
    getRootDirectoryHandle,
    readFile,
    updateFile
} from './fileSystemService';

function getSingleLineValue(content: string, key: string) {
    const line = content
        .split('\n')
        .map(item => item.trim())
        .find(item => item.startsWith(`${key}:`));

    return line?.substring(key.length + 1).trim() ?? '';
}

function parseAttendanceInfo(content: string, folderName: string): Attendance {
    return {
        id: Number(getSingleLineValue(content, 'Id')),
        folderName,
        patientId: Number(getSingleLineValue(content, 'PacienteId')),
        patientName: getSingleLineValue(content, 'PacienteNome'),
        date: getSingleLineValue(content, 'Data'),
        startTime: getSingleLineValue(content, 'HorarioInicio'),
        endTime: getSingleLineValue(content, 'HorarioFim'),
        type: getSingleLineValue(content, 'Tipo'),
        status: getSingleLineValue(content, 'Status'),
        professional: getSingleLineValue(content, 'Profissional'),
        summary: getSingleLineValue(content, 'Resumo'),
        completedAt: getSingleLineValue(content, 'ConcluidoEm')
    };
}

function parseReportContent(content: string) {
    const marker = 'Relatorio:';
    const index = content.indexOf(marker);

    if (index === -1) {
        return '';
    }

    return content.substring(index + marker.length).trim();
}

async function readAttendanceReport(attendance: Attendance) {
    const rootHandle = getRootDirectoryHandle();

    if (!rootHandle) {
        return '';
    }

    try {
        const patientsDirectory = await getDirectory(rootHandle, 'Pacientes');
        const patientDirectory = await patientsDirectory.getDirectoryHandle(`paciente_${attendance.patientId}`);
        const fileName = `resultado_atendimento_${attendance.id}.txt`;

        const content = await readFile(patientDirectory, fileName);

        return parseReportContent(content);
    } catch {
        return '';
    }
}

export async function getAttendances(): Promise<Attendance[]> {
    const rootHandle = getRootDirectoryHandle();

    if (!rootHandle) {
        return [];
    }

    const attendancesDirectory = await getDirectory(rootHandle, 'Atendimentos');
    const attendances: Attendance[] = [];

    for await (const [name, handle] of attendancesDirectory.entries()) {
        if (handle.kind !== 'directory') {
            continue;
        }

        const attendanceDirectory = await attendancesDirectory.getDirectoryHandle(name);
        const content = await readFile(attendanceDirectory, 'info.txt');
        const attendance = parseAttendanceInfo(content, name);

        attendance.report = await readAttendanceReport(attendance);

        attendances.push(attendance);
    }

    return attendances.sort((a, b) => a.id - b.id);
}

export async function getAttendancesByPatient(patientId: number) {
    const attendances = await getAttendances();

    return attendances
        .filter(attendance => attendance.patientId === patientId)
        .sort((a, b) => {
            const firstDate = new Date(`${a.date}T${a.startTime || '00:00'}`).getTime();
            const secondDate = new Date(`${b.date}T${b.startTime || '00:00'}`).getTime();

            return firstDate - secondDate;
        });
}

export async function createAttendance(attendance: Omit<Attendance, 'id' | 'folderName'>) {
    const rootHandle = getRootDirectoryHandle();

    if (!rootHandle) {
        throw new Error('Pasta principal não selecionada.');
    }

    const attendancesDirectory = await getDirectory(rootHandle, 'Atendimentos');
    const folderName = await getNextIncrementalDirectoryName(attendancesDirectory, 'atendimento');
    const id = Number(folderName.replace('atendimento_', ''));
    const attendanceDirectory = await attendancesDirectory.getDirectoryHandle(folderName, { create: true });

    const content = `Id: ${id}
PacienteId: ${attendance.patientId}
PacienteNome: ${attendance.patientName}
Data: ${attendance.date}
HorarioInicio: ${attendance.startTime}
HorarioFim: ${attendance.endTime}
Status: Agendado
Tipo: ${attendance.type}
Profissional: ${attendance.professional}
Resumo: ${attendance.summary ?? ''}
CriadoEm: ${new Date().toISOString()}
AtualizadoEm: ${new Date().toISOString()}
`;

    await createFile(attendanceDirectory, 'info.txt', content);

    return id;
}

export async function completeAttendance(attendance: Attendance, report: string) {
    const rootHandle = getRootDirectoryHandle();

    if (!rootHandle) {
        throw new Error('Pasta principal não selecionada.');
    }

    const completedAt = new Date().toISOString();

    const attendancesDirectory = await getDirectory(rootHandle, 'Atendimentos');
    const attendanceDirectory = await attendancesDirectory.getDirectoryHandle(attendance.folderName);

    const updatedAttendanceContent = `Id: ${attendance.id}
PacienteId: ${attendance.patientId}
PacienteNome: ${attendance.patientName}
Data: ${attendance.date}
HorarioInicio: ${attendance.startTime}
HorarioFim: ${attendance.endTime}
Status: Concluido
Tipo: ${attendance.type}
Profissional: ${attendance.professional}
Resumo: ${attendance.summary ?? ''}
ConcluidoEm: ${completedAt}
AtualizadoEm: ${completedAt}
`;

    await updateFile(attendanceDirectory, 'info.txt', updatedAttendanceContent);

    const patientsDirectory = await getDirectory(rootHandle, 'Pacientes');
    const patientDirectory = await patientsDirectory.getDirectoryHandle(`paciente_${attendance.patientId}`);

    const reportContent = `AtendimentoId: ${attendance.id}
PacienteId: ${attendance.patientId}
PacienteNome: ${attendance.patientName}
Data: ${attendance.date}
Horario: ${attendance.startTime} - ${attendance.endTime}
Profissional: ${attendance.professional}
Tipo: ${attendance.type}
ConcluidoEm: ${completedAt}

Relatorio:
${report}
`;

    await updateFile(patientDirectory, `resultado_atendimento_${attendance.id}.txt`, reportContent);
}

export async function updateAttendanceReport(attendance: Attendance, report: string) {
    await completeAttendance(attendance, report);
}