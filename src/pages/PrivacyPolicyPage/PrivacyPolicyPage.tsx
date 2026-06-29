import { Card, Container, Stack, Text, Title } from '@mantine/core';

export default function PrivacyPolicyPage() {
    return (
        <Container size="md">

            <Stack>

                <Title order={1}>
                    Política de Privacidade
                </Title>

                <Text>
                    Esta Política de Privacidade descreve como o MedFlow coleta,
                    utiliza e protege as informações fornecidas pelos usuários,
                    em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
                </Text>

                <Card withBorder>

                    <Title order={3}>
                        Dados coletados
                    </Title>

                    <Text mt="sm">
                        O MedFlow armazena apenas as informações necessárias para o
                        funcionamento da plataforma, como dados do profissional,
                        pacientes e configurações do sistema.
                    </Text>

                </Card>

                <Card withBorder>

                    <Title order={3}>
                        Utilização dos dados
                    </Title>

                    <Text mt="sm">
                        Os dados são utilizados exclusivamente para permitir a gestão
                        da agenda médica, melhorar a experiência do usuário e garantir
                        o correto funcionamento da plataforma.
                    </Text>

                </Card>

                <Card withBorder>

                    <Title order={3}>
                        Compartilhamento
                    </Title>

                    <Text mt="sm">
                        O MedFlow não comercializa informações pessoais. Os dados somente
                        poderão ser compartilhados quando exigido por determinação legal.
                    </Text>

                </Card>

                <Card withBorder>

                    <Title order={3}>
                        Segurança
                    </Title>

                    <Text mt="sm">
                        Adotamos medidas técnicas e administrativas para proteger
                        os dados contra acesso não autorizado, alteração,
                        divulgação ou destruição.
                    </Text>

                </Card>

                <Card withBorder>

                    <Title order={3}>
                        Direitos do usuário
                    </Title>

                    <Text mt="sm">
                        O usuário poderá solicitar acesso, correção ou exclusão de seus
                        dados pessoais, conforme previsto na LGPD.
                    </Text>

                </Card>

                <Card withBorder>

                    <Title order={3}>
                        Contato
                    </Title>

                    <Text mt="sm">
                        contato@sunsalesystem.com.br
                    </Text>

                </Card>

            </Stack>

        </Container>
    );
}