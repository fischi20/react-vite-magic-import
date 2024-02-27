import Unimport from 'unimport/unplugin'
import fs from 'fs'
import type { UnimportPluginOptions } from 'unimport/unplugin';
import { Preset } from 'unimport';
import { readTSConfig, resolveTSConfig, writeTSConfig } from 'pkg-types';
import { consola } from 'consola'

type Package = Preset;

type SimpleReactAutoImportOptions = {
    /**
     * @default 'codegen/imports/imports.d.ts' if typescript project
     * @default 'node_modules/@types/import.ds.ts' if javascript project
     * @description Directory in which the type definitions will be stored
     */
    typeDefinitions?: string,
    /**
     * @default []
     * @description List of packages to be imported automatically
     */
    packages?: Package[],
    /**
     * @default []
     * @description List of directories to be imported automatically
     */
    dirs?: string[],
    /**
     * @default false
     * @description Whether to disable the import of react hooks by default
     */
    disableReactHookImport?: boolean
}

const removeEmptyDirectory = (dir: string) => {
    //recursively remove empty directories left over by deleted files
    if (dir === '') {
        return;
    }

    if (fs.existsSync(dir)) {
        let files = fs.readdirSync(dir);
        if (files.length === 0) {
            fs.rmdirSync(dir);
            removeEmptyDirectory(dir.split('/').slice(0, -1).join('/'));
        }
    }
}

export const createSimpleOptions = async (options: SimpleReactAutoImportOptions = {}): Promise<Partial<UnimportPluginOptions>> => {
    let defaultDirectory = 'node_modules/@types/codegen/imports/import.ds.ts';
    let isTS = false;
    let tsConfigPath = undefined;
    try {
        tsConfigPath = await resolveTSConfig();
        defaultDirectory = 'codegen/imports/imports.d.ts';
        isTS = true;
    } catch (e) {}
    
    const { typeDefinitions = defaultDirectory, packages = [], dirs = [], disableReactHookImport } = options;

    //get directories to be created for the type definitions
    const dts_directory = typeDefinitions.split('/').slice(0, -1).join('/');

    if (dts_directory) {
        //deleate old version of file if it exists
        if (fs.existsSync(typeDefinitions)) {
            fs.rmSync(typeDefinitions);
        }

        removeEmptyDirectory(dts_directory);

        fs.mkdirSync(dts_directory, { recursive: true })
    }

    let defaultPresets: UnimportPluginOptions['presets'] = [];
    if (!disableReactHookImport) {
        defaultPresets = ['react']
    }

    if (!isTS) {
        consola.info(`Adding type definitions file to ${typeDefinitions}. `)
    } else {
        const tsconfig = await readTSConfig();
        if (!tsconfig.include?.includes(typeDefinitions)) {
            consola.warn(`You need to add the typedefinitions file to your tsconfig.json file to get editor support for the auto-imported packages.`)
            const resp = await consola.prompt(`Do you want to add the include to your tsconfig.json file automatically?`, { type: 'confirm' })
            if (resp) {
                if (tsconfig.include !== undefined) {
                    tsconfig.include?.push(typeDefinitions);
                } else {
                    tsconfig.include = [typeDefinitions];
                }
                writeTSConfig(tsConfigPath!, tsconfig);
            } else {
                consola.warn(`Please add the following line to your tsconfig.json file to get editor support for the auto-imported packages:
                    "include": ["${typeDefinitions}"] `)
            }
        }
    }

    return {
        dts: typeDefinitions,
        presets: [...defaultPresets, ...packages],
        dirs: dirs
    }
}


/** 
 * To simplified options for react projects that should work out fine in most cases, use the createSimpleOptions function
 * If you want a higher level of customization, you can use the UnimportPluginOptions interface to create your own options
 * @link https://unjs.io/packages/unimport
 * 
*/
export const createReactUnimportPlugin = async (options?: Partial<UnimportPluginOptions>) => {
    if (!options) {
        options = await createSimpleOptions();
    }
    return Unimport.vite(options);
}