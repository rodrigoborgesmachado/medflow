import { Button, Card, Group, ScrollArea, Stack, Table, Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';
import { downloadCsv, type ReportColumn } from '../utils/reportUtils';

type ReportCardProps<T extends Record<string, string | number | null | undefined>> = {
    title: string;
    description: string;
    fileName: string;
    columns: ReportColumn<T>[];
    rows: T[];
    children?: ReactNode;
};

export function ReportCard<T extends Record<string, string | number | null | undefined>>({
    title,
    description,
    fileName,
    columns,
    rows,
    children
}: ReportCardProps<T>) {
    return (
        <Card withBorder shadow="sm" padding="lg">
            <Stack>
                <Group justify="space-between" align="flex-start">
                    <div>
                        <Title order={3}>{title}</Title>
                        <Text c="dimmed" size="sm">{description}</Text>
                    </div>

                    <Button
                        variant="light"
                        disabled={rows.length === 0}
                        onClick={() => downloadCsv(fileName, columns, rows)}
                    >
                        Baixar CSV
                    </Button>
                </Group>

                {children}

                <Text size="sm" c="dimmed">
                    {rows.length} registro(s)
                </Text>

                <ScrollArea>
                    <Table striped highlightOnHover withTableBorder withColumnBorders>
                        <Table.Thead>
                            <Table.Tr>
                                {columns.map(column => (
                                    <Table.Th key={String(column.key)}>{column.label}</Table.Th>
                                ))}
                            </Table.Tr>
                        </Table.Thead>

                        <Table.Tbody>
                            {rows.map((row, rowIndex) => (
                                <Table.Tr key={rowIndex}>
                                    {columns.map(column => (
                                        <Table.Td key={String(column.key)}>
                                            {row[column.key]}
                                        </Table.Td>
                                    ))}
                                </Table.Tr>
                            ))}

                            {rows.length === 0 && (
                                <Table.Tr>
                                    <Table.Td colSpan={columns.length}>
                                        <Text c="dimmed" ta="center">
                                            Nenhum dado para os filtros selecionados.
                                        </Text>
                                    </Table.Td>
                                </Table.Tr>
                            )}
                        </Table.Tbody>
                    </Table>
                </ScrollArea>
            </Stack>
        </Card>
    );
}
