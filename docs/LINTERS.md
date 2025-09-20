# 🧹 Linters y Formateo de Código

Este proyecto utiliza ESLint y Prettier para mantener un código limpio y consistente.

## 📋 Configuración

### ESLint
- **Archivo:** `.eslintrc.js`
- **Reglas:** TypeScript + NestJS optimizadas
- **Plugins:** @typescript-eslint, prettier

### Prettier
- **Archivo:** `.prettierrc`
- **Configuración:** Single quotes, trailing commas, 2 espacios

## 🚀 Comandos Disponibles

```bash
# Formatear código
npm run format

# Verificar formateo (sin cambiar archivos)
npm run format:check

# Ejecutar ESLint y arreglar automáticamente
npm run lint

# Solo verificar ESLint (sin arreglar)
npm run lint:check

# Ejecutar tests
npm test

# Tests con cobertura
npm run test:cov
```

## 🔄 GitHub Actions

### Workflows Automáticos:
1. **`.github/workflows/lint.yml`** - Linting y formateo
2. **`.github/workflows/ci.yml`** - Tests, build y cobertura

### Triggers:
- Push a `main` o `develop`
- Pull requests a `main` o `develop`

## 📁 Archivos Ignorados

### ESLint (`.eslintignore`):
- `node_modules/`
- `dist/`
- `coverage/`
- Archivos de configuración

### Prettier (`.prettierignore`):
- `node_modules/`
- `dist/`
- `package-lock.json`
- Archivos generados

## ⚙️ Configuración del IDE

### VS Code
Instala estas extensiones:
- ESLint
- Prettier - Code formatter
- TypeScript Importer

### Configuración recomendada (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": ["typescript"],
  "prettier.requireConfig": true
}
```

## 🎯 Reglas Principales

### ESLint:
- ✅ Usar `const` en lugar de `let` cuando sea posible
- ✅ No variables no utilizadas
- ✅ Interfaces sin prefijo `I`
- ⚠️ `any` genera warning
- ❌ No `console.log` en producción

### Prettier:
- ✅ Comillas simples
- ✅ Punto y coma al final
- ✅ 2 espacios de indentación
- ✅ Líneas máximo 100 caracteres

## 🔧 Solución de Problemas

### Error: "ESLint couldn't find a configuration file"
```bash
# Verificar que existe .eslintrc.js
ls -la .eslintrc.js

# Reinstalar dependencias
npm ci
```

### Error: "Prettier not found"
```bash
# Instalar Prettier globalmente (opcional)
npm install -g prettier

# O usar npx
npx prettier --write "src/**/*.ts"
```

## 📊 Cobertura de Código

- **Mínimo:** 80% en branches, functions, lines, statements
- **Archivo:** `jest.config.js`
- **Reporte:** `coverage/lcov-report/index.html`

## 🚨 Pre-commit Hooks

Si usas Husky, se ejecutarán automáticamente:
- Linting
- Formateo
- Tests

```bash
# Instalar Husky (opcional)
npm install --save-dev husky
npx husky install
npx husky add .husky/pre-commit "npm run lint:check && npm run format:check && npm test"
```
