import { Group, Title } from '@mantine/core';
import type { ReactNode } from 'react';

type PageHeaderProps = {
    title: string;
    children?: ReactNode;
};

export function PageHeader({ title, children }: PageHeaderProps) {
    return (
        <Group justify="space-between" mb="lg">
            <Title order={2}>{title}</Title>
            {children}
        </Group>
    );
}