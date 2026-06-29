import { get, set } from 'idb-keyval';
import type { FileSystemDirectoryHandle, FileSystemFileHandle } from '../types/FileSystemAccess';

const ROOT_DIRECTORY_KEY = 'medflow-root-directory';

let rootDirectoryHandle: FileSystemDirectoryHandle | null = null;

async function writeTextFile(fileHandle: FileSystemFileHandle, content: string) {
    const writable = await fileHandle.createWritable();

    await writable.write(content);
    await writable.close();
}

async function readTextFile(fileHandle: FileSystemFileHandle) {
    const file = await fileHandle.getFile();

    return await file.text();
}

async function verifyPermission(directoryHandle: FileSystemDirectoryHandle) {
    const options = { mode: 'readwrite' as const };

    if ((await directoryHandle.queryPermission?.(options)) === 'granted') {
        return true;
    }

    if ((await directoryHandle.requestPermission?.(options)) === 'granted') {
        return true;
    }

    return false;
}

export async function selectMainDirectory() {
    if (!window.showDirectoryPicker) {
        throw new Error('Seu navegador não suporta seleção de pastas. Use Chrome ou Edge.');
    }

    rootDirectoryHandle = await window.showDirectoryPicker();

    const hasPermission = await verifyPermission(rootDirectoryHandle);

    if (!hasPermission) {
        throw new Error('Permissão para acessar a pasta negada.');
    }

    await set(ROOT_DIRECTORY_KEY, rootDirectoryHandle);
    sessionStorage.setItem('medflow-root-name', rootDirectoryHandle.name);

    await createBaseStructure(rootDirectoryHandle);

    return rootDirectoryHandle;
}

export async function loadSavedMainDirectory() {
    const savedHandle = await get<FileSystemDirectoryHandle>(ROOT_DIRECTORY_KEY);

    if (!savedHandle) {
        return null;
    }

    const hasPermission = await verifyPermission(savedHandle);

    if (!hasPermission) {
        return null;
    }

    rootDirectoryHandle = savedHandle;

    await createBaseStructure(rootDirectoryHandle);
    sessionStorage.setItem('medflow-root-name', rootDirectoryHandle.name);

    return rootDirectoryHandle;
}

export function getRootDirectoryHandle() {
    return rootDirectoryHandle;
}

export async function createBaseStructure(rootHandle: FileSystemDirectoryHandle) {
    await rootHandle.getDirectoryHandle('Pacientes', { create: true });
    await rootHandle.getDirectoryHandle('Atendimentos', { create: true });

    const infoFile = await rootHandle.getFileHandle('informacoes.txt', { create: true });

    const file = await infoFile.getFile();
    const currentContent = await file.text();

    if (currentContent.trim()) {
        return;
    }

    const content = `Sistema: MedFlow Agenda
Versao: 1.0
Profissional:
Descricao: Sistema local para controle de pacientes, atendimentos, evolução clínica e agenda.
CriadoEm: ${new Date().toISOString()}
`;

    await writeTextFile(infoFile, content);
}

export async function getDirectory(rootHandle: FileSystemDirectoryHandle, name: string) {
    return await rootHandle.getDirectoryHandle(name, { create: true });
}

export async function createFile(directory: FileSystemDirectoryHandle, fileName: string, content: string) {
    const fileHandle = await directory.getFileHandle(fileName, { create: true });

    await writeTextFile(fileHandle, content);
}

export async function updateFile(directory: FileSystemDirectoryHandle, fileName: string, content: string) {
    const fileHandle = await directory.getFileHandle(fileName, { create: true });

    await writeTextFile(fileHandle, content);
}

export async function readFile(directory: FileSystemDirectoryHandle, fileName: string) {
    const fileHandle = await directory.getFileHandle(fileName);

    return await readTextFile(fileHandle);
}

export async function getNextIncrementalDirectoryName(
    directory: FileSystemDirectoryHandle,
    prefix: string
) {
    let max = 0;

    for await (const [name, handle] of directory.entries()) {
        if (handle.kind !== 'directory') {
            continue;
        }

        if (!name.startsWith(`${prefix}_`)) {
            continue;
        }

        const number = Number(name.replace(`${prefix}_`, ''));

        if (!Number.isNaN(number) && number > max) {
            max = number;
        }
    }

    return `${prefix}_${max + 1}`;
}

export async function getNextIncrementalFileName(
    directory: FileSystemDirectoryHandle,
    prefix: string,
    extension = 'txt'
) {
    let max = 0;

    for await (const [name, handle] of directory.entries()) {
        if (handle.kind !== 'file') {
            continue;
        }

        if (!name.startsWith(`${prefix}_`)) {
            continue;
        }

        const number = Number(
            name
                .replace(`${prefix}_`, '')
                .replace(`.${extension}`, '')
        );

        if (!Number.isNaN(number) && number > max) {
            max = number;
        }
    }

    return `${prefix}_${max + 1}.${extension}`;
}

export async function readRootInfo() {
    const rootHandle = getRootDirectoryHandle();

    if (!rootHandle) {
        return '';
    }

    try {
        return await readFile(rootHandle, 'informacoes.txt');
    } catch {
        return '';
    }
}

export async function getProfessionalName() {
    const content = await readRootInfo();

    const line = content
        .split('\n')
        .map(item => item.trim())
        .find(item => item.startsWith('Profissional:'));

    return line?.replace('Profissional:', '').trim() ?? '';
}

export async function updateProfessionalName(professionalName: string) {
    const rootHandle = getRootDirectoryHandle();

    if (!rootHandle) {
        throw new Error('Pasta principal não selecionada.');
    }

    const currentContent = await readRootInfo();

    const lines = currentContent
        ? currentContent.split('\n')
        : [];

    const hasProfessionalLine = lines.some(line => line.trim().startsWith('Profissional:'));

    const updatedLines = hasProfessionalLine
        ? lines.map(line => line.trim().startsWith('Profissional:')
            ? `Profissional: ${professionalName}`
            : line
        )
        : [...lines, `Profissional: ${professionalName}`];

    await updateFile(rootHandle, 'informacoes.txt', updatedLines.join('\n'));
}