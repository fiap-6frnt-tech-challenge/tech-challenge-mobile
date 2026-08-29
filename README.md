# Bytebank Mobile

Bytebank Mobile e o aplicativo de gerenciamento financeiro da Fase 3 da FIAP POSTECH.

| Dashboard                                      | Transações                                         |
| ---------------------------------------------- | -------------------------------------------------- |
| ![Dashboard](docs/assets/readme/dashboard.png) | ![Transações](docs/assets/readme/transactions.png) |

## Sobre o projeto

O Bytebank oferece uma experiencia autenticada e individual por usuario para acompanhar e organizar financas, com dados e arquivos mantidos no Firebase.

## Funcionalidades

- [x] Cadastro com e-mail e senha, login, sessao persistida e logout.
- [x] Dashboard com saldo, resumos de receitas e despesas, graficos e estados acessiveis de carregamento, vazio e erro.
- [x] Criacao, edicao, exclusao, listagem e paginacao de transacoes.
- [x] Busca por prefixo na descricao normalizada e filtros por tipo, categoria e intervalo de datas.
- [x] Sugestao de categoria durante o lancamento de transacoes.
- [x] Anexos de comprovantes JPG, PNG, WEBP e PDF de ate 5 MB, armazenados por usuario autenticado.
- [x] Catalogo Storybook no dispositivo para componentes base, formularios, filtros, anexos, KPIs, graficos e componentes de movimento.

## Tecnologias

- Expo 56
- React Native 0.85 e React 19
- TypeScript 6
- Expo Router
- Firebase 12
- Context API
- NativeWind e Tailwind CSS
- React Hook Form e Zod
- Storybook React Native 10
- Vitest
- EAS Build

## Arquitetura e estrutura

As dependencias seguem este fluxo:

```text
app routes -> screens/components -> contexts/hooks -> services -> Firebase
                                      domain (pure rules and schemas)
```

```text
app/                         Expo Router routes and layouts
src/components/ui/           Design-system components and stories
src/components/features/     Feature composition and feedback states
src/screens/                 Auth, dashboard, profile, and transaction screens
src/contexts/                Auth and transaction state providers
src/hooks/                   Dashboard, pagination, attachments, and motion hooks
src/domain/                  Types, schemas, normalization, and pure business rules
src/services/                Firebase, auth, transaction, and storage adapters
.rnstorybook/                On-device Storybook configuration
docs/                        Planning and delivery documentation
```

## Pré-requisitos

- Node.js 20 ou superior; Node.js 24 e recomendado para acompanhar o CI.
- npm e Git; em um clone novo, prefira `npm ci`.
- Um projeto Firebase com permissao para configurar Auth, Firestore, Storage, rules e indexes.
- Expo Go compativel ou um Simulador iOS/Emulador Android com o native development build.
- Xcode para desenvolvimento iOS e Android Studio/JDK para desenvolvimento Android.
- Java 21 somente ao executar a Firebase Emulator Suite exatamente como no CI.
- Uma conta Expo somente para builds em nuvem com EAS.
