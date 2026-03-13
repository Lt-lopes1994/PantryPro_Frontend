# Versionamento SemVer - PantryPro Frontend

Este projeto segue [Semantic Versioning](https://semver.org/) (MAJOR.MINOR.PATCH).

## Comandos

```bash
# Corrigiu bug → patch (0.2.0 → 0.2.1)
npm run version:patch

# Nova funcionalidade → minor (0.2.0 → 0.3.0)
npm run version:minor

# Breaking change ou 1.0.0 → major (0.2.0 → 1.0.0)
npm run version:major
```

Cada comando atualiza o `package.json`, cria um commit e uma tag git (ex: `v0.2.1`).

## Conventional Commits

Use commits no formato [Conventional Commits](https://www.conventionalcommits.org/):

| Prefixo | Uso | Bump |
|---------|-----|------|
| `feat:` | Nova funcionalidade | MINOR |
| `fix:` | Correção de bug | PATCH |
| `docs:` | Apenas documentação | - |
| `style:` | Formatação, sem mudança de lógica | - |
| `refactor:` | Refatoração | PATCH ou MINOR |
| `perf:` | Melhoria de performance | PATCH |
| `test:` | Testes | - |
| `chore:` | Manutenção (deps, config) | PATCH ou - |

**Exemplos:**
```
feat: adiciona filtro de receitas por categoria
fix: corrige validação do formulário de registro
chore: atualiza dependências
```

## Fluxo recomendado

1. Fazer alterações e commit com mensagem convencional
2. Antes de merge/release: `npm run version:patch` (ou minor/major)
3. Push: `git push origin main --follow-tags`

## CHANGELOG

Após cada bump de versão, atualize o `CHANGELOG.md` com as mudanças daquela versão.
