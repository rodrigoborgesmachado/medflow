# MedFlow Agenda

Sistema local para gerenciamento de pacientes, agenda médica/fisioterapêutica e evolução clínica, utilizando apenas o sistema de arquivos do computador, sem necessidade de banco de dados.

## Objetivo

O MedFlow Agenda foi desenvolvido para profissionais da saúde que desejam manter um histórico organizado de pacientes e atendimentos de forma simples, rápida e totalmente local.

Toda a persistência dos dados é realizada em arquivos `.txt`, permitindo fácil backup, sincronização e consulta.

## Principais funcionalidades

* Cadastro de pacientes
* Agendamento de atendimentos
* Dashboard diário da agenda
* Evolução clínica dos pacientes
* Relatórios de atendimento
* Pesquisa de pacientes por nome
* Controle de horários ocupados
* Configuração do profissional responsável
* Troca da pasta principal de armazenamento
* Armazenamento local utilizando File System Access API

## Tecnologias utilizadas

* React
* TypeScript
* Vite
* Mantine UI
* React Router
* React Hot Toast
* idb-keyval

## Estrutura dos dados

Após selecionar uma pasta, o sistema cria automaticamente a estrutura abaixo:

```text
Pasta Principal
│
├── informacoes.txt
│
├── Pacientes
│   ├── paciente_1
│   │   ├── info.txt
│   │   ├── resultado_atendimento_1.txt
│   │   ├── resultado_atendimento_2.txt
│   │   └── ...
│   │
│   └── paciente_2
│       └── ...
│
└── Atendimentos
    ├── atendimento_1
    │   └── info.txt
    │
    ├── atendimento_2
    │   └── info.txt
    │
    └── ...
```

## Organização dos arquivos

### informacoes.txt

Armazena informações gerais do sistema.

Exemplo:

```text
Sistema: MedFlow Agenda
Versao: 1.0
Profissional: João Silva
Descricao: Sistema local para controle de pacientes.
```

### Pacientes

Cada paciente possui sua própria pasta contendo:

* informações cadastrais;
* histórico de atendimentos;
* relatórios clínicos.

### Atendimentos

Cada atendimento possui apenas informações de agenda:

* paciente;
* data;
* horário;
* status;
* profissional;
* tipo de atendimento.

O relatório clínico permanece armazenado na pasta do paciente.

## Dashboard

O Dashboard apresenta:

* quantidade de atendimentos do dia;
* atendimentos agendados;
* atendimentos concluídos;
* horários livres;
* agenda diária;
* criação rápida de novos horários.

## Como executar

Instale as dependências:

```bash
npm install
```

Inicie o projeto:

```bash
npm run dev
```

Para gerar a versão de produção:

```bash
npm run build
```

A aplicação será gerada na pasta:

```text
dist/
```

## Requisitos

O sistema utiliza a **File System Access API**, portanto recomenda-se utilizar:

* Google Chrome
* Microsoft Edge

## Licença

Projeto desenvolvido para fins de estudo e uso pessoal.

---

Desenvolvido com ❤️ utilizando React + TypeScript.
