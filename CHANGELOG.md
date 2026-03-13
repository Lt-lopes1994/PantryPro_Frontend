# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

## [0.2.0] - 2025-03-12

### Added
- Dashboard com páginas: Restaurantes, Estoque, Compras, Receitas, Cadastros, Fluxo de Caixa
- Login e registro de usuários
- Página de verificação de email (`/verify-email`)
- authApi.verifyEmail e authApi.refresh
- Documentação de rotas da API (`docs/API_ROUTES.md`)

### Changed
- Contraste de fontes em todos os formulários (text-black, placeholder legível)
- Categorias de unidade exibidas em português (Peso, Volume, etc.)

### Fixed
- Atualização Next.js para 15.5.7 (CVE-2025-66478)
- Contraste em inputs de Login e Registro

### Security
- Patch de segurança CVE-2025-66478 (Next.js)

---

## Como versionar

- **PATCH** (0.2.0 → 0.2.1): correções de bugs
- **MINOR** (0.2.0 → 0.3.0): novas funcionalidades (retrocompatíveis)
- **MAJOR** (0.2.0 → 1.0.0): mudanças incompatíveis ou primeira versão estável
