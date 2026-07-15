# Web Portal — Start here

Pacote completo para Execute. Documentação em `.specs/features/web-portal/`.

| Doc | Papel |
|-----|--------|
| [context.md](./context.md) | Decisões de produto |
| [spec.md](./spec.md) | Requisitos WPORT-* + fases W1–W4 |
| [design.md](./design.md) | Arquitetura Approach A + contratos API |
| [tasks.md](./tasks.md) | **T1–T14 W1** (uma commit por task) |

## Começar W1 agora

```bash
# 1) Subir docs para dev (PR ou merge da branch feature/web-portal-spec)
# 2) Nova branch de implementação:
git fetch origin && git checkout dev && git pull --ff-only origin dev
./scripts/git/new-feature-branch.sh feature/web-portal-w1

# 3) Agente / você:
# /tlc-spec-driven implement web-portal — execute T1 from tasks.md
```

Ordem: **T1 → T14** (batches no `tasks.md`). Não iniciar W2 antes do Verifier W1.

## W1 em uma linha

Scaffold portal → CORS prod + OAuth web → tokens/UI → session/API → login → gates → checkout → perfil → dashboard → convites → i18n → Render/README → smoke e2e.
