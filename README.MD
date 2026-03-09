# 🐱 Cathub

> **Cathub** es un programa de escritorio en formato **widget**, en desarrollo activo.  
> Este proyecto contiene tanto el frontend (Tauri) como el backend (Node.js/Express).

---

## ⚡ Estado del proyecto

- Desarrollo activo ✅
- Aplicación de escritorio (Tauri) 🖥
- Versión Web para manejo de conexiones y endpoints 🔗
- Monorepo: App y Web en un solo repositorio 📦

---

## 🛠 Tecnologías utilizadas

![Tauri](https://img.shields.io/badge/Tauri-2.0-blue?logo=tauri)  
![Node.js](https://img.shields.io/badge/Node.js-18-green?logo=node.js)  
![Express](https://img.shields.io/badge/Express-5.2.1-lightgrey?logo=express)  
![Vite](https://img.shields.io/badge/Vite-4.0-purple?logo=vite)  
![React](https://img.shields.io/badge/React-19.0-blue?logo=react)  
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)  
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-blue?logo=tailwindcss)  
![Supabase](https://img.shields.io/badge/Supabase-2.0-35c12b?logo=supabase)

---

## 📂 Estructura del repositorio

```text
cathub/
├─ app/            # Aplicación Tauri + Vite
├─ web/            # API Node.js/Express
├─ tests/          # Scripts y pruebas
├─ .gitignore      # Reglas de git
└─ package.json    # Workspaces raíz
```

---

# Instalar dependencias de frontend y backend

```text
npm install
```

# Levantar frontend Vite

```text
npm run dev:app
```

# Levantar Tauri (desktop)

```text
npm run tauri-dev
```

# Levantar web

```text
npm run dev:web
```

Copyright (c) 2026 CodeByEvans

Todos los derechos reservados.

Queda prohibido cualquier uso, copia, distribución, modificación o explotación de este software sin autorización expresa del autor.

Se permite únicamente la descarga y ejecución local con fines personales y educativos, sin fines comerciales ni distribución.
