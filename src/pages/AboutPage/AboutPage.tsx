import {
    Card,
    Container,
    List,
    Stack,
    Text,
    ThemeIcon,
    Title
} from '@mantine/core';

import { IconCheck } from '@tabler/icons-react';

export default function AboutPage() {
    return (
        <Container size="md">

            <Stack>

                <Title order={1}>
                    Sobre o MedFlow
                </Title>

                <Text>
                    O MedFlow é uma plataforma desenvolvida pela SunSale System para simplificar
                    a organização da rotina de profissionais da saúde.
                </Text>

                <Card withBorder>

                    <Title order={3}>
                        Nossa missão
                    </Title>

                    <Text mt="sm">
                        Tornar a gestão da agenda médica simples, segura e eficiente,
                        permitindo que o profissional dedique seu tempo ao que realmente
                        importa: o atendimento ao paciente.
                    </Text>

                </Card>

                <Card withBorder>

                    <Title order={3}>
                        O que oferecemos
                    </Title>

                    <List
                        mt="md"
                        spacing="sm"
                        icon={
                            <ThemeIcon color="green" size={20}>
                                <IconCheck size={14} />
                            </ThemeIcon>
                        }
                    >
                        <List.Item>Gestão de pacientes</List.Item>
                        <List.Item>Controle de consultas</List.Item>
                        <List.Item>Agenda organizada</List.Item>
                        <List.Item>Armazenamento local dos dados</List.Item>
                        <List.Item>Interface moderna</List.Item>
                        <List.Item>Produtividade para profissionais da saúde</List.Item>
                    </List>

                </Card>

                <Card withBorder>

                    <Title order={3}>
                        Sobre a SunSale System
                    </Title>

                    <Text mt="sm">
                        A SunSale System é especializada no desenvolvimento de softwares
                        personalizados, criando soluções modernas para empresas e profissionais
                        que desejam automatizar processos e aumentar sua produtividade.
                    </Text>

                </Card>

            </Stack>

        </Container>
    );
}