# React Vite Magic Import
This is a vite plugin for react that enables the automatic import
of code using the unimport library.

## Installation
- npm
    ```sh
    npm install react-vite-magic-import
    ```
- yarn
    ```sh
    yarn add react-vite-magic-import
    ```
- pnpm
    ```sh
    pnpm install react-vite-magic-import
    ``` 

## Usage
1. Add the plugin to your vite.config.ts/js file
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import {createReactUnimportPlugin} from 'react-vite-magic-import'

export default defineConfig({
  plugins: [react(), await createReactUnimportPlugin()],
})
```

## Configuration
You can pass the original [unimport](https://unjs.io/packages/unimport) options to the createReactUnimportPlugin function, or you can use the `createSimpleOptions` helper to create the options. The Simple options should generally be enaugh for most usecases.

## Simple Options
- #### typeDefinitions
    This option is the path to where the type defintions are located for the editor to use.
    You need to add this path to the tsconfig.json.
    If not present, the plugin will ask the user if it should add it to the tsconfig.json file or if the user preferes doing it by hand.
- #### packages
    This option allows you to specify packages, or parts of packages that should be added to the imports.
- #### dirs
    This option allows you to specify directories that should be automatically added to the imports (e.g. src/components, src/hooks, etc).
- #### disableReactHookImport
    This option allows you to disable the default import of react hooks. This is usefull if you want to customize which hooks you want to import from react automatically and which not, or if you don't want to import them in the first place.