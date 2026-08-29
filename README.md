# Bytebank Mobile

Bytebank Mobile é o aplicativo móvel de gerenciamento financeiro da FIAP POSTECH para a Fase 3.

| Dashboard                                      | Transações                                         |
| ---------------------------------------------- | -------------------------------------------------- |
| ![Dashboard](docs/assets/readme/dashboard.png) | ![Transações](docs/assets/readme/transactions.png) |

## Sobre o projeto

O Bytebank oferece uma experiência autenticada e individual por usuário para acompanhar e organizar finanças, com dados e arquivos mantidos no Firebase.

## Funcionalidades

- [x] Cadastro com e-mail e senha, login, sessão persistida e logout.
- [x] Dashboard com saldo, resumos de receitas e despesas, gráficos e estados acessíveis de carregamento, vazio e erro.
- [x] Criação, edição, exclusão, listagem e paginação de transações.
- [x] Busca por prefixo na descrição normalizada e filtros por tipo, categoria e intervalo de datas.
- [x] Sugestão de categoria durante o lançamento de transações.
- [x] Anexos de comprovantes JPG, PNG, WEBP e PDF de até 5 MB, armazenados por usuário autenticado.
- [x] Catálogo Storybook no dispositivo para componentes base, formulários, filtros, anexos, KPIs, gráficos e componentes de movimento.

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

As dependências seguem este fluxo:

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

- Node.js 20 ou superior; Node.js 24 é recomendado para acompanhar o CI.
- npm e Git; em um clone novo, siga o comando de instalação indicado abaixo.
- Um projeto Firebase com permissão para configurar Auth, Firestore, Storage, rules e indexes.
- Expo Go compatível ou um Simulador iOS/Emulador Android com o native development build.
- Xcode para desenvolvimento iOS e Android Studio/JDK para desenvolvimento Android.
- Java 21 somente ao executar a Firebase Emulator Suite exatamente como no CI.
- Uma conta Expo somente para builds em nuvem com EAS.

## Instalação e execução

Em um terminal, crie o checkout local e instale as dependências:

```bash
git clone https://github.com/fiap-6frnt-tech-challenge/tech-challenge-mobile.git
cd tech-challenge-mobile
npm ci
```

## Configuração do Firebase

Ainda dentro do checkout criado acima:

1. Crie um projeto no Firebase.
2. Registre um aplicativo Web, pois o app usa o Firebase JavaScript SDK.
3. Ative `Authentication -> Sign-in method -> Email/Password`.
4. Crie o Cloud Firestore.
5. Ative o Cloud Storage e confirme que o nome do bucket copiado para `.env` termina com o bucket configurado pelo Firebase.
6. Autentique a Firebase CLI, selecione o projeto e publique as rules e os indexes versionados.

```bash
npx -p firebase-tools firebase login
npx -p firebase-tools firebase use --add
npx -p firebase-tools firebase deploy --only firestore:rules,firestore:indexes,storage
```

`firebase use --add` associa o checkout local ao projeto selecionado pelo desenvolvedor; ele não adiciona secrets privados do cliente ao Git.

## Variáveis de ambiente

Ainda dentro do checkout, crie o arquivo local a partir do exemplo:

```bash
cp .env.example .env
```

Preencha `EXPO_PUBLIC_FIREBASE_API_KEY`, `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`, `EXPO_PUBLIC_FIREBASE_PROJECT_ID`, `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`, `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` e `EXPO_PUBLIC_FIREBASE_APP_ID` com os valores em Firebase Console -> Project settings -> Your apps -> SDK setup and configuration. Mantenha `EXPO_PUBLIC_STORYBOOK=false` para o app normal antes de iniciar o Expo.

`.env` e `.env.local` são ignorados pelo Git. Valores `EXPO_PUBLIC_*` são incorporados ao bundle do cliente e não devem ser tratados como secrets de servidor. A autorização vem dos caminhos autenticados e das rules versionadas no repositório, não de ocultar a configuração do Firebase.
Com a configuração publicada e o `.env` preenchido, inicie o Expo:

```bash
npm start
```

No terminal do Expo, pressione `a` para abrir no Android, `i` para abrir no iOS e `r` para recarregar o app. Para gerar e executar diretamente o native development build depois da configuração, use:

```bash
npm run ios
npm run android
```

Uma versão da Expo Go da App Store incompatível com o Expo SDK 56 não abre o projeto. Nesse caso, use a Expo Go compatível com o SDK ou o simulador/emulador com o native development build gerado pelos comandos nativos.

## Busca e índices do Firestore

As operações de criação e atualização gravam `descriptionNormalized`. As consultas normalizam o termo digitado, aplicam o intervalo `>= prefix` e `<= prefix\uf8ff`, ordenam por descrição normalizada e data, e paginam com cursor de documento. Isso oferece correspondência por prefixo normalizada e sem distinção de maiúsculas/minúsculas ou acentos, não busca arbitrária por substring nem busca full-text. Registros criados antes da existência do campo normalizado precisam de backfill.

| Use                      | Ordered/filter fields                                                |
| ------------------------ | -------------------------------------------------------------------- |
| Type                     | `type ASC`, `date DESC`                                              |
| Category                 | `category ASC`, `date DESC`                                          |
| Type + category          | `type ASC`, `category ASC`, `date DESC`                              |
| Search                   | `descriptionNormalized ASC`, `date DESC`                             |
| Type + search            | `type ASC`, `descriptionNormalized ASC`, `date DESC`                 |
| Category + search        | `category ASC`, `descriptionNormalized ASC`, `date DESC`             |
| Type + category + search | `type ASC`, `category ASC`, `descriptionNormalized ASC`, `date DESC` |

`firebase deploy --only firestore:indexes` publica essas definições. Se uma futura forma de consulta exigir um index ausente, o erro do Firestore ainda pode apresentar um link direto para o Console.

## Segurança

Os dados do Firestore ficam em `users/{uid}/transactions/{transactionId}`; apenas o `uid` autenticado correspondente pode ler ou escrever. Os comprovantes no Storage ficam em `receipts/{uid}/{transactionId}/{fileName}`; apenas o usuário autenticado correspondente pode ler, criar, atualizar ou excluir.

As rules de upload aceitam JPEG, PNG, WEBP ou PDF com no máximo 5 MB.

## Testes e qualidade

Para uma verificação local rápida, execute:

```bash
npm test
npm run lint
npx tsc --noEmit
```

O gate completo usado pelo CI para as rules do Firestore e a suíte de domínio é:

```bash
npx -p firebase-tools firebase emulators:exec --only firestore "npm run test:domain"
```

Esse comando requer Java 21 e executa contra o emulador local, sem usar dados de produção do Firestore.

As notas de performance, com os números antes/depois no Node e no emulador, estão em [docs/perf.md](docs/perf.md).

## Storybook

O catálogo no dispositivo pode ser iniciado em qualquer uma destas modalidades:

```bash
npm run storybook
npm run storybook:ios
npm run storybook:android
```

Esses scripts definem `EXPO_PUBLIC_STORYBOOK=true`. O `metro.config.js` inclui as stories somente nesse modo, e o catálogo no dispositivo é iniciado em `.rnstorybook/index.ts`. No fluxo normal, `npm start` mantém o Storybook desabilitado por meio do `.env`.

## Build Android

Autentique-se no EAS e crie o build de preview para Android:

```bash
npx eas-cli login
npx eas-cli build --platform android --profile preview
```

O perfil `preview` em `eas.json` usa distribuição interna. Os valores Firebase `EXPO_PUBLIC_*` também precisam existir no ambiente EAS usado pelo build. A S4-03 é responsável por validar e instalar o APK resultante.

## Entregáveis

- [Builds Android (EAS)](https://expo.dev/accounts/bytebanks-team/projects/bytebank-mobile/builds)
- Vídeo demonstrativo: enquanto a S4-06 estiver incompleta, consulte [docs/sprint-4-polish-deploy/06-demo-video.md](docs/sprint-4-polish-deploy/06-demo-video.md). Quando o vídeo existir, a S4-06 substituirá esta nota pela URL pública imutável.

## Solução de problemas

- `EXPO_PUBLIC_*` ausente: copie e preencha o `.env`, depois reinicie o Metro com `npx expo start --clear`.
- `auth/operation-not-allowed` ou credencial inválida: confirme o provedor Email/Password e as credenciais de teste.
- Índice ausente no Firestore: publique `firestore.indexes.json`, aguarde a criação do índice e tente novamente.
- `storage/unauthorized`: publique `storage.rules` e confirme que o caminho do comprovante usa o `uid` autenticado.
- Permissão de câmera ou galeria negada: habilite as permissões do Bytebank nas configurações do dispositivo e tente selecionar o arquivo novamente.
- Persistência de sessão divergente: limpe os dados do app ou reinstale o development build e faça login de novo; a autenticação usa persistência com AsyncStorage.
- Incompatibilidade com Expo Go: use uma Expo Go compatível com o SDK ou `npm run ios`/`npm run android`.
