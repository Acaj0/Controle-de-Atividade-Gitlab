# Monitor de Commits

## Descrição
O **Monitor de Commits** é uma aplicação desenvolvida em Next.js que fornece uma visão semanal dos commits de cada colaborador e apresenta uma grade anual de commits por projeto. Com essa ferramenta, é possível acompanhar a produtividade da equipe de desenvolvimento e ter insights sobre a frequência das contribuições.

## Funcionalidades
- Exibição semanal dos commits por colaborador
- Visualização anual dos commits organizados em um grid por projeto
- Interface intuitiva e responsiva
- Filtragem de commits por usuário e por projeto

## Tecnologias Utilizadas
- **Next.js** - Framework para aplicações React
- **React** - Biblioteca para construção da interface
- **Tailwind CSS** - Para estilização moderna e responsiva
- **GitLab API** - Para obtenção dos commits

## Requisitos
Antes de rodar o projeto, certifique-se de ter instalado:
- **Node.js** (versão 16 ou superior)
- **NPM** ou **Yarn**
- **Chave de API** do GitLab

## Instalação e Configuração
```sh
# Clone o repositório
git clone http://gitlab.ci.redeflex.com.br/gestaoti/monitorcommit.git
cd MonitorCommits

# Instale as dependências
npm install
# ou
yarn install

# Execute o projeto em ambiente de desenvolvimento
npm run dev
# ou
yarn dev

# Para build e produção
npm run build
npm start
```
O servidor será iniciado em `http://localhost:3000`


