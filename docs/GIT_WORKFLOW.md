# Git workflow — Forma

Fluxo de integração contínua com três níveis de branch. Objetivo: `main` estável, `dev` como linha de integração, e tasks paralelas sem merges diretos na produção.

## Branches

| Branch | Papel | Quem mergeia aqui |
|--------|-------|-------------------|
| `main` | Produção / releases | **Somente `dev`** |
| `dev` | Integração diária | Feature branches |
| `feature/*`, `fix/*`, `cursor/*` | Task isolada | Nunca direto em `main` |

## Regras (obrigatórias)

1. **Toda branch de trabalho nasce de `dev` atualizada** — nunca de `main` (exceto hotfix documentado).
2. **Feature → `dev`** via PR (ou merge local + push de `dev`).
3. **`dev` → `main`** apenas quando o conjunto integrado estiver pronto para release.
4. **Nunca** merge direto feature → `main`.
5. **Nunca** push direto em `main` a partir de uma feature branch.

## Fluxo diário (uma task)

```bash
# 1. Partir de dev atualizada
git fetch origin
git checkout dev
git pull --ff-only origin dev

# 2. Criar branch da task (use o helper)
./scripts/git/new-feature-branch.sh feature/minha-task

# 3. Trabalhar, commitar, push
git push -u origin feature/minha-task

# 4. Abrir PR: feature/minha-task → dev
# 5. Após merge na dev, apagar branch local/remota da task
```

## Tasks paralelas (vários agentes / devs)

Cada task usa **sua própria branch** a partir do mesmo ponto em `dev`:

```
dev ──┬── feature/task-a ──► PR ──► dev
      ├── feature/task-b ──► PR ──► dev
      └── cursor/task-c  ──► PR ──► dev
```

### Evitar conflitos

- **Antes de abrir PR**, sincronize com `dev`:
  ```bash
  ./scripts/git/sync-with-dev.sh
  ```
- Resolva conflitos **na feature branch**, não em `dev`.
- Prefira PRs **pequenos e frequentes** — reduz janela de conflito.
- Se duas tasks tocam os mesmos arquivos, coordene ordem de merge ou combine numa branch só.

### Ordem de merge recomendada

1. Task com menor escopo / menos arquivos compartilhados primeiro.
2. Após cada merge em `dev`, quem está em task paralela roda `sync-with-dev.sh`.
3. Só abra PR `dev → main` quando `dev` passar nos gates (`lint`, `check-types`, testes relevantes).

## Release (`dev` → `main`)

```bash
git checkout dev
git pull --ff-only origin dev
# gates
pnpm lint && pnpm check-types

git checkout main
git pull --ff-only origin main
git merge --ff-only dev   # preferir fast-forward; se divergiu, merge commit explícito
git push origin main

git checkout dev
```

## Hotfix (exceção)

Emergência em produção quando `dev` está à frente:

```bash
git checkout main && git pull --ff-only origin main
git checkout -b fix/hotfix-descricao
# fix + testes
git checkout main && git merge --ff-only fix/hotfix-descricao && git push origin main
git checkout dev && git merge main && git push origin dev
```

Hotfix **sempre** volta para `dev` para não perder o fix na integração.

## Enforcement

| Camada | O quê |
|--------|-------|
| CI (`.github/workflows/branch-policy.yml`) | PR para `main` só aceita head `dev`; PR para `dev` não aceita `main` |
| Hook local (`.githooks/pre-push`) | Bloqueia push de feature branch para `origin/main` |
| Cursor (`.cursor/rules/git-workflow.mdc`) | Agentes seguem este fluxo |
| `AGENTS.md` | Referência rápida para cloud agents |

### Ativar hooks locais (uma vez por clone)

```bash
./scripts/setup-git-hooks.sh
```

## Convenção de nomes

| Prefixo | Uso |
|---------|-----|
| `feature/` | Nova funcionalidade |
| `fix/` | Correção de bug |
| `cursor/` | Branch efêmera de agente Cursor (merge → `dev`, depois apagar) |
| `chore/` | Manutenção, deps, CI |

## Checklist antes de PR → `dev`

- [ ] Branch criada a partir de `dev` recente
- [ ] `./scripts/git/sync-with-dev.sh` rodou sem conflitos pendentes
- [ ] `pnpm lint && pnpm check-types` passam
- [ ] Testes da área tocada passam
- [ ] Spec/handoff atualizados se aplicável (`.specs/`)
