# Testes E2E (Maestro)

Cobre os cinco fluxos críticos da demo — ver [docs/sprint-4-polish-deploy/05-e2e.md](../docs/sprint-4-polish-deploy/05-e2e.md).

| Flow                                                   | Fluxo crítico                                            |
| ------------------------------------------------------ | -------------------------------------------------------- |
| [01-auth.yaml](./01-auth.yaml)                         | abrir → registrar → logout → login                        |
| [02-transaction-create.yaml](./02-transaction-create.yaml) | nova transação com sugestão de categoria → aparece na lista |
| [03-filter.yaml](./03-filter.yaml)                     | aplicar filtro por categoria → lista filtra               |
| [04-infinite-scroll.yaml](./04-infinite-scroll.yaml)   | rolar → carrega mais                                      |
| [05-attachment.yaml](./05-attachment.yaml)             | anexar imagem da galeria → aparece no formulário          |

`helpers/` guarda subflows reutilizáveis chamados via `runFlow`; o `config.yaml` restringe a execução aos flows da raiz e fixa a ordem 01→05.

## Rodar

```bash
maestro test .maestro/ -e E2E_PASSWORD=<senha-do-usuario-de-teste>
```

Um flow isolado:

```bash
maestro test .maestro/03-filter.yaml -e E2E_PASSWORD=<senha>
```

## Variáveis

`E2E_PASSWORD` **não tem default** e é obrigatória — nenhuma senha fica versionada. As demais têm default e só precisam de `-e` para sobrescrever:

| Variável               | Default              | Para quê                                                        |
| ---------------------- | -------------------- | --------------------------------------------------------------- |
| `E2E_PASSWORD`         | —                    | senha do usuário de teste                                        |
| `E2E_EMAIL`            | `dev@test.com`       | usuário de teste dos flows 02–05                                 |
| `E2E_NAME`             | `Maestro E2E`        | nome usado no registro (flow 01)                                 |
| `E2E_DEV_SERVER`       | `http://.*:8081`     | entrada do Expo Dev Launcher a tocar (ver "Dev client" abaixo)   |
| `E2E_ITEM_GALERIA`     | `Photo taken on .*`  | rótulo do item na galeria do sistema (flow 05)                   |
| `E2E_CONFIRMA_GALERIA` | `Done`               | botão de confirmação da galeria (flow 05)                        |

## Pré-requisitos

1. **Usuário de teste dedicado no Firebase.** Os flows 02–05 logam com `E2E_EMAIL`/`E2E_PASSWORD`. O 01 registra uma conta descartável com e-mail aleatório a cada execução — elas se acumulam no Firebase Auth e devem ser limpas periodicamente.
2. **Mais de 20 transações na conta de teste** — `pageSize` é 20 (`src/services/transactions.service.ts`), e o flow 04 verifica que o contador de resultados cresce além da primeira página. Com 20 ou menos ele falha.
3. **Ao menos uma imagem na galeria do dispositivo** para o flow 05:
   ```bash
   adb push assets/icon.png /sdcard/Pictures/comprovante.png
   adb shell am broadcast -a android.intent.action.MEDIA_SCANNER_SCAN_FILE -d file:///sdcard/Pictures/comprovante.png
   ```
4. **Emulador ou device conectado** (`adb devices`).

## Dev client x build standalone

**Num dev client, desligue o `Tools button` no menu de desenvolvedor do Expo antes de rodar a suíte.** Esse botão flutuante fica exatamente sobre o botão "Abrir perfil" do header, então qualquer toque ali abre o menu de dev em vez de navegar para o perfil — o que quebra todo flow que passa por logout. Para desligar: abra o menu de dev (Ctrl+M no emulador), role até o fim e desative `Tools button`; o ajuste fica salvo no app. Num APK standalone esse botão não existe.

O alvo natural do E2E é o APK standalone (Task 03). Num **dev client**, `launchApp` cai na tela do Expo Dev Launcher em vez do app, então `helpers/dev-launcher.yaml` toca a entrada do servidor Metro quando ela aparece. Em build standalone o helper é no-op, porque a condição `visible: 'Development Build'` não bate. Rodando contra dev client, o Metro precisa estar no ar (`npx expo start`) e o primeiro `launchApp` de cada flow leva ~1 min carregando o bundle.

## Limpeza automática

Os flows 02 e 03 criam uma transação com descrição única (`Uber E2E <n>`) e a apagam no fim via `helpers/delete-transaction.yaml`, então a conta de teste não acumula lixo. Se um run falhar no meio, a transação daquele run pode sobrar — basta apagá-la pelo app.

## Rótulos do sistema operacional

Os flows tocam a galeria do sistema, que responde no **idioma do dispositivo**, não no do app. Os defaults (`Photo taken on .*`, `Done`) assumem device em inglês; num emulador em pt-BR, sobrescreva com `-e E2E_ITEM_GALERIA=... -e E2E_CONFIRMA_GALERIA=...`.
