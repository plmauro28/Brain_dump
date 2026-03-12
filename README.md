# Brain-Dump 🧠⚡

Aplicación web minimalista para organizar tus pensamientos caóticos en listas de tareas estructuradas usando Mistral AI a través de OpenRouter.

## Requisitos Previos

Para ejecutar este proyecto, necesitas tener instalado **Node.js** y **npm** (Node Package Manager) en tu sistema.

## Configuración y Ejecución

1. **Instalar Node.js**: Si no lo tienes, descárgalo e instálalo desde [nodejs.org](https://nodejs.org/).
2. **Instalar dependencias**: Abre una terminal en esta carpeta y ejecuta:
   ```bash
   npm install
   ```
3. **Configurar API Key**:
   - Renombra el archivo `.env.example` a `.env`
   - Consigue una API key en [OpenRouter](https://openrouter.ai/)
   - Pega tu clave en el archivo `.env`
4. **Ejecutar el proyecto**:
   ```bash
   npm run dev
   ```
5. Abre la URL que aparece en la terminal (usualmente `http://localhost:5173`) en tu navegador.

## Tecnologías Utilizadas
- React + Vite
- Tailwind CSS
- OpenRouter API (openrouter/free)
- Lucide React (Íconos)
- React Markdown
