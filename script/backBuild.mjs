#!/usr/bin/env node

import {
  readdir,
  readFile as readfil,
  writeFile as writefil,
  appendFile as appendfil,
} from 'node:fs/promises';

import Hjson from 'hjson';
import dotEnv from 'dotenv';

dotEnv.config();

const isFile = (file) => {
  return file.includes('.ts') || file.includes('.js');
};

const isIndexFile = (file) => {
  return file.includes('index.ts') || file.includes('index.js');
};

const isParamFile = (file) => {
  return file.includes('].ts') || file.includes('].js');
};

const getParam = (file) => {
  return file?.split(/\]\.(t|j)s/)?.[0]?.split('[')?.[1];
};

const initTemplate = async () => {
  const base = await readfil('baseTemplate.yaml', { encoding: 'utf8' });
  await writefil('./template.yaml', base);
};

const appendTemplate = async (text) => {
  await appendfil('./template.yaml', text);
};

const loadTsConfig = async () => {
  const tsconfig = await readfil('./tsconfig.json', { encoding: 'utf8' });
  return Hjson.parse(tsconfig);
};

const addMethodToTemplate = async (functionName, type, path) => {
  let method;
  switch (type.toLowerCase()) {
    case 'create':
      method = 'post';
      break;
    case 'read':
      method = 'get';
      break;
    case 'update':
      method = 'put';
      break;
    case 'delete':
      method = 'delete';
      break;
    default:
      method = type;
      break;
  }
  appendTemplate(
    `        ${functionName + type}:\n` +
      `          Type: Api \n` +
      `          Properties:\n` +
      `            Path: ${path}\n` +
      `            Method: ${method}\n`
  );
};

const addMethodsToTemplate = async (functionName) => {
  const roots = ['./src', './source', './dist/src', './dist/source'];
  const subRoots = ['controller', 'controllers'];
  for (const root of roots) {
    for (const subRoot of subRoots) {
      const path = root + '/' + subRoot;
      const files = await readdir(path);
      for (const file of files) {
        if (file.includes(functionName)) {
          const content = (
            await readfil('./tsconfig.json', {
              encoding: 'utf8',
            })
          )
            .split('extends')[1]
            .split(/(BaseController)|(,)/)
            .filter(
              (value) =>
                value.trim() !== null &&
                value.trim() !== '' &&
                value.trim() !== undefined
            );

          for (const type of content) {
            addMethodToTemplate(functionName, type);
          }
          addMethodToTemplate(functionName, 'option');
        }
      }
    }
  }
};

const addGlobalsToTemplate = async () => {
  let tracingEnabled = process.env.AWS_API_TRACING_ENABLED || 'true';
  tracingEnabled = tracingEnabled.toLowerCase();
  tracingEnabled =
    tracingEnabled.charAt(0).toUpperCase() + tracingEnabled.slice(1);
  await appendTemplate(
    'Globals:\n' +
      '  Function:\n' +
      `    Timeout: ${process.env.AWS_FUNCTION_TIMEOUT || 3}\n` +
      `    Tracing: ${process.env.AWS_FUNCTION_TRACING || 'Active'}\n` +
      '  Api:\n' +
      `    TracingEnabled: ${tracingEnabled}\n`
  );
};

const addMetadataToTemplate = async (entryPoints) => {
  const tsconfig = await loadTsConfig();
  await appendTemplate(
    '    Metadata:\n' +
      '      BuildMethod: esbuild\n' +
      '      BuildProperties: esbuild\n' +
      `        Minify: ${process.env.AWS_FUNCTION_MINIFY || 'true'}\n` +
      `        Target: ${tsconfig.compilerOptions.target}\n` +
      `        Sourcemap: ${tsconfig.compilerOptions.sourceMap}\n` +
      `        EntryPoints:\n` +
      entryPoints?.map((entryPoint) => `        - ${entryPoint}\n`)?.join()
  );
};

const readFolder = async (path, roots) => {
  await initTemplate();
  await addGlobalsToTemplate();
  await appendTemplate('Resources:');
  for (const root of roots) {
    const realPath = root !== undefined ? root + '/' + path : path;
    try {
      const files = await readdir(realPath);
      let found = false;
      for (const file of files) {
        if (!isFile(file)) await readFolder(path + '/' + file, [root]);
        else if (isFile(file)) {
          await readFile(path, file, found);
          found = true;
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error) {
      console.log(error.message);
    }
  }
};

const readFile = async (path, file, found) => {
  const isIndex = isIndexFile(file);
  const param = !isIndex && isParamFile(file) ? getParam(file) : undefined;

  const route = '/' + path + (param !== undefined ? `:${param}` : '');
  addFunction(functionName, file, route, path, found);
};

const addFunction = async (functionName, file, route, path, found) => {
  const architectures = JSON.parse(
    process.env.AWS_FUNCTION_ARCHITECTURES || '["x86_64"]'
  );
  if (!found)
    await appendTemplate(
      `  ${functionName}Function:\n` +
        '    Type: AWS::Serverless::Function\n' +
        '    Properties:\n' +
        `      CodeUri: ${path}\n` +
        `      Handler: index\n` +
        `      Runtime: ${process.env.AWS_FUNCTION_RUNTIME || 'nodejs16.x'}\n` +
        `      Architectures:\n` +
        architectures
          ?.map((architecture) => `        - ${architecture}\n`)
          ?.join() +
        `      Events:\n`
    );
  await addMethodsToTemplate(functionName);
  await addMetadataToTemplate();
};

const execute = async () =>
  await readFolder('/api', [
    '.',
    './src',
    './source',
    './src/pages',
    './source/pages',
    './dist',
    './dist/src',
    './dist/source',
    './dist/src/pages',
    './dist/source/pages',
  ]);

execute();
