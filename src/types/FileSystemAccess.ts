export type FileSystemPermissionMode = 'read' | 'readwrite';

export type FileSystemHandleKind = 'file' | 'directory';

export interface FileSystemHandle {
    kind: FileSystemHandleKind;
    name: string;
    queryPermission?: (descriptor?: { mode: FileSystemPermissionMode }) => Promise<PermissionState>;
    requestPermission?: (descriptor?: { mode: FileSystemPermissionMode }) => Promise<PermissionState>;
}

export interface FileSystemFileHandle extends FileSystemHandle {
    kind: 'file';
    getFile: () => Promise<File>;
    createWritable: () => Promise<FileSystemWritableFileStream>;
}

export interface FileSystemDirectoryHandle extends FileSystemHandle {
    kind: 'directory';
    getDirectoryHandle: (name: string, options?: { create?: boolean }) => Promise<FileSystemDirectoryHandle>;
    getFileHandle: (name: string, options?: { create?: boolean }) => Promise<FileSystemFileHandle>;
    removeEntry: (name: string, options?: { recursive?: boolean }) => Promise<void>;
    entries: () => AsyncIterableIterator<[string, FileSystemHandle]>;
}

declare global {
    interface Window {
        showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
    }
}
