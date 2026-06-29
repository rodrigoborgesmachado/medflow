import {
    Anchor,
    Card,
    Container,
    Group,
    Stack,
    Text,
    Title
} from '@mantine/core';

export default function ContactPage() {
    return (
        <Container size="md">

            <Stack>

                <Title order={1}>
                    Contato
                </Title>

                <Text>
                    Caso tenha dúvidas, sugestões ou encontre algum problema no MedFlow,
                    entre em contato conosco.
                </Text>

                <Card withBorder>

                    <Stack>

                        <Group justify="space-between">
                            <Text fw={600}>Empresa</Text>
                            <Text>SunSale System</Text>
                        </Group>

                        <Group justify="space-between">
                            <Text fw={600}>E-mail</Text>

                            <Anchor href="mailto:rodrigo.machado@sunsalesystem.com.br">
                                rodrigo.machado@sunsalesystem.com.br
                            </Anchor>
                        </Group>

                        <Group justify="space-between">
                            <Text fw={600}>Website</Text>

                            <Anchor
                                href="https://www.sunsalesystem.com.br"
                                target="_blank"
                            >
                                www.sunsalesystem.com.br
                            </Anchor>
                        </Group>

                    </Stack>

                </Card>

            </Stack>

        </Container>
    );
}