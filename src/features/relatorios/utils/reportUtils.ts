export type ReportColumn<T> = {
    key: keyof T;
    label: string;
};

export function isDateInRange(date: string, startDate: string, endDate: string) {
    if (!date) {
        return false;
    }

    return date >= startDate && date <= endDate;
}

export function formatDate(date: string) {
    if (!date) {
        return '';
    }

    return new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR');
}

export function getDaysSince(date: string) {
    if (!date) {
        return null;
    }

    const today = new Date();
    const pastDate = new Date(`${date}T00:00:00`);
    const diff = today.getTime() - pastDate.getTime();

    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export function downloadCsv<T extends Record<string, string | number | null | undefined>>(
    fileName: string,
    columns: ReportColumn<T>[],
    rows: T[]
) {
    const escapeCell = (value: string | number | null | undefined) => {
        const content = String(value ?? '');

        return `"${content.replaceAll('"', '""')}"`;
    };
    const separator = ';';
    const header = columns.map(column => escapeCell(column.label)).join(separator);
    const body = rows.map(row =>
        columns.map(column => escapeCell(row[column.key])).join(separator)
    );
    const csv = `\uFEFF${[header, ...body].join('\r\n')}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
}
