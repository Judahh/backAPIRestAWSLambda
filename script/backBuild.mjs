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

let entryPoints = [];

const loadTsConfig = async () => {
  const tsconfig = await readfil('./tsconfig.json', { encoding: 'utf8' });
  return Hjson.parse(tsconfig);
};

const tsconfig = await loadTsConfig();

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
  await writefil(
    './template.yaml',
    `AWSTemplateFormatVersion: '2010-09-09'\n` +
      `Transform: AWS::Serverless-2016-10-31\n` +
      `Description: >\n` +
      `  SAM Template for aws-lambda\n\n`
  );
};

const appendTemplate = async (text) => {
  await appendfil('./template.yaml', text);
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
    case 'update2':
      method = 'patch';
      break;
    case 'delete':
      method = 'delete';
      break;
    case 'option':
      method = 'option';
      break;
    default:
      method = type;
      break;
  }
  console.log('new:', functionName, type, path);
  await appendTemplate(
    `        ${functionName + type}:\n` +
      `          Type: Api\n` +
      `          Properties:\n` +
      `            Path: /${path}\n` +
      `            Method: ${method}\n`
  );
  if (type.toLowerCase() === 'update')
    await addMethodToTemplate(functionName, 'Update2', path);
};

const addMethodsToTemplate = async (functionName, functionPath) => {
  const roots = ['./src', './source', './dist/src', './dist/source'];
  const subRoots = ['controller', 'controllers'];
  try {
    if (functionName)
      for (const root of roots) {
        for (const subRoot of subRoots) {
          const path = root + '/' + subRoot;
          try {
            const files = await readdir(path);
            for (const file of files) {
              // console.log('check:', file, functionName);
              if (
                file
                  .toLowerCase()
                  .includes(functionName.toLowerCase() + 'controller') &&
                !file.toLowerCase().includes('.ts') &&
                !file.toLowerCase().includes('.map')
              ) {
                console.log('found:', file, functionName);
                let content = await readfil(path + '/' + file, {
                  encoding: 'utf8',
                });
                // console.log('found:', content);
                content = content.split('extends')[1].split('exports')[0];
                // console.log('content:', content);
                content = content
                  .replaceAll(
                    /(\(0)|(\))|(\()|(_\d)|(BaseController)|(backapirest\/)|(class)|(default)|(from)|(")|(')|(@)|(-)|(lambda)|(functions)|(function)|(azure)|(digital-ocean)|(oci)|(gcp)|(aws)|(aws)|(next)|(any)|(import)|(export)|(Mixin)|(\,)|(\.)|(\n)|(\{)|(\})|(\ )/gm,
                    ','
                  )
                  .split(',')
                  .filter((n) => n);

                console.log('content: ', content);

                for (const type of content) {
                  await addMethodToTemplate(functionName, type, functionPath);
                }
                await addMethodToTemplate(functionName, 'Option', functionPath);
              }
            }
          } catch (error) {}
        }
      }
  } catch (error) {}
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
      `    TracingEnabled: ${tracingEnabled}\n\n`
  );
};

const addMetadataToTemplate = async (entryPoints) => {
  if (entryPoints && entryPoints.length > 0) {
    const sEntryPoints = entryPoints
      ?.map(
        (entryPoint) =>
          `        - ${
            entryPoint.includes('[') ? "'" + entryPoint + "'" : entryPoint
          }\n`
      )
      ?.join('');
    await appendTemplate(
      '    Metadata:\n' +
        '      BuildMethod: esbuild\n' +
        '      BuildProperties:\n' +
        `        Minify: ${process.env.AWS_FUNCTION_MINIFY || 'true'}\n` +
        `        Target: "${tsconfig.compilerOptions.target || 'es2020'}"\n` +
        `        Sourcemap: ${tsconfig.compilerOptions.sourceMap || 'true'}\n` +
        `        EntryPoints:\n` +
        sEntryPoints
    );
  }
};

const readFolder = async (path, roots) => {
  for (const root of roots) {
    const realPath = root !== undefined ? root + '/' + path : path;
    try {
      const files = await readdir(realPath);
      let found = false;
      entryPoints = [];
      for (const file of files) {
        try {
          if (!isFile(file)) await readFolder(path + '/' + file, [root]);
          else if (
            isFile(file) &&
            !file.toLowerCase().includes('handler') &&
            !file.toLowerCase().includes('.ts') &&
            !file.toLowerCase().includes('.map')
          ) {
            await readFile(path, file, found, realPath);
            found = true;
          }
        } catch (error) {
          console.log(error.message);
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error) {
      console.log(error.message);
    }
  }
};

const readFile = async (path, file, found, realPath) => {
  const isIndex = isIndexFile(file);
  const param = !isIndex && isParamFile(file) ? getParam(file) : undefined;
  const route = '/' + path + (param !== undefined ? `:${param}` : '');
  let functionName = path.split('/');
  functionName = functionName[functionName.length - 1];
  await addFunction(functionName, file, route, path, found, realPath);
};

const addFunction = async (
  functionName,
  file,
  route,
  path,
  found,
  realPath
) => {
  const architectures = JSON.parse(
    process.env.AWS_FUNCTION_ARCHITECTURES || '["x86_64"]'
  )
    ?.map((architecture) => `        - ${architecture}\n`)
    ?.join('');
  entryPoints.push(file);
  if (!found) {
    console.log('NEW FUNCTION: ' + functionName);
    await appendTemplate(
      `  ${functionName}Function:\n` +
        '    Type: AWS::Serverless::Function\n' +
        '    Properties:\n' +
        `      CodeUri: ${realPath}\n` +
        `      Handler: index\n` +
        `      Runtime: ${process.env.AWS_FUNCTION_RUNTIME || 'nodejs16.x'}\n` +
        `      Architectures:\n` +
        architectures +
        `      Events:\n`
    );
    await addMethodsToTemplate(functionName, path);
  } else {
    await addMetadataToTemplate(entryPoints);
  }
};

const execute = async () => {
  await initTemplate();
  await addGlobalsToTemplate();
  await appendTemplate('Resources:\n');
  await readFolder('api', [
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
};

await execute();
