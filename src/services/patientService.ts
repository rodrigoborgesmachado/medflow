import type { Patient } from '../types/Patient';
import {
    createFile,
    getDirectory,
    getNextIncrementalDirectoryName,
    getRootDirectoryHandle,
    readFile
} from './fileSystemService';

function parsePatientInfo(content: string, folderName: string): Patient {
    const getValue = (key: string) => {
        const line = content.split('\n').find(item => item.startsWith(`${key}:`));

        return line?.replace(`${key}:`, '').trim() ?? '';
    };

    return {
        id: Number(getValue('Id')),
        folderName,
        name: getValue('Nome'),
        birthDate: getValue('DataNascimento'),
        phone: getValue('Telefone'),
        email: getValue('Email'),
        document: getValue('Documento'),
        profession: getValue('Profissao'),
        address: getValue('Endereco'),
        observations: getValue('ObservacoesGerais')
    };
}

export async function getPatients(): Promise<Patient[]> {
    const rootHandle = getRootDirectoryHandle();

    if (!rootHandle) {
        return [];
    }

    const patientsDirectory = await getDirectory(rootHandle, 'Pacientes');
    const patients: Patient[] = [];

    for await (const [name, handle] of patientsDirectory.entries()) {
        if (handle.kind !== 'directory') {
            continue;
        }

        const patientDirectory = await patientsDirectory.getDirectoryHandle(name);
        const content = await readFile(patientDirectory, 'info.txt');

        patients.push(parsePatientInfo(content, name));
    }

    return patients.sort((a, b) => a.id - b.id);
}

export async function createPatient(patient: Omit<Patient, 'id' | 'folderName'>) {
    const rootHandle = getRootDirectoryHandle();

    if (!rootHandle) {
        throw new Error('Pasta principal não selecionada.');
    }

    const patientsDirectory = await getDirectory(rootHandle, 'Pacientes');
    const folderName = await getNextIncrementalDirectoryName(patientsDirectory, 'paciente');
    const id = Number(folderName.replace('paciente_', ''));
    const patientDirectory = await patientsDirectory.getDirectoryHandle(folderName, { create: true });

    const content = `Id: ${id}
Nome: ${patient.name}
DataNascimento: ${patient.birthDate ?? ''}
Telefone: ${patient.phone ?? ''}
Email: ${patient.email ?? ''}
Documento: ${patient.document ?? ''}
Profissao: ${patient.profession ?? ''}
Endereco: ${patient.address ?? ''}
ObservacoesGerais: ${patient.observations ?? ''}
CriadoEm: ${new Date().toISOString()}
AtualizadoEm: ${new Date().toISOString()}
`;

    await createFile(patientDirectory, 'info.txt', content);
    await createFile(patientDirectory, 'evolucao.txt', 'Resumo geral da evolução do paciente:\n');

    return id;
}