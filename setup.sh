#!/bin/bash

# Navegar a la carpeta frontend
cd frontend

# Eliminar node_modules y package-lock.json
rm -rf node_modules package-lock.json

# Instalar dependencias
npm install

# Ejecutar el build
npm run build

# Volver al directorio anterior
cd ..
