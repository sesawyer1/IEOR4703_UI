# SETUP INSTRUCTIONS

Before running the app, make sure you download:

- Node.js (v18 or higher)

  Check with:

  ```bash
  node -v
  ```

1. Clone the repository

```bash
  git clone <REPO_URL>
  cd <REPO_NAME>
```

2. Install npm

```bash
npm install
```

3. Run development server

```bash
npm run dev
```

4. Open App

   Copy and paste the local URL into browser

```bash
http://localhost:5173 //this is an example url
```

## Github Workflow Notes

DO NOT WORK DIRECTLY ON MAIN

1. Create a new local branch before starting edits

```bash
git checkout -b your-branch-name
```

2. Make edits/test locally, run the code using the following and verify changes work

```bash
npm run dev
```

3. Commit changes

```bash
git add .
git commit -m "MESSAGE DESCRIBING CHANGES"
```

4. Push your branch to Github

```bash
git push origin your-branch-name
```

5. To open a pull request:

   a. Click "Compare & pull request" in Github repo

   b. Open a PR from your branch --> main

   c. add description of changes

6. if main changes while you're working:

```bash
git checkout main
git pull origin main
git checkout your-branch-name
git merge main
```

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
