import { Anchor, Divider, Group, Stack, Text } from '@mantine/core';
import { Link } from 'react-router-dom';

import './Footer.css';

export function Footer() {
    return (
        <footer className="footer">
            <Divider mb="lg" />

            <Stack gap={4} align="center">
                <Group gap="lg">
                    <Anchor component={Link} to="/about">
                        Sobre
                    </Anchor>

                    <Anchor component={Link} to="/privacy-policy">
                        Política de Privacidade
                    </Anchor>

                    <Anchor component={Link} to="/contact">
                        Contato
                    </Anchor>
                </Group>

                <Text size="xs" c="dimmed">
                    © {new Date().getFullYear()} SunSale System. Todos os direitos reservados.
                </Text>
            </Stack>
        </footer>
    );
}