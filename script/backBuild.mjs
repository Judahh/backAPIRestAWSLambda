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
let allEntryPoints = [];
let envVars = JSON.parse(JSON.stringify(process.env) || '{}');

for (const key in envVars) {
  if (Object.hasOwnProperty.call(envVars, key)) {
    if (
      key.includes('npm_package') ||
      key.includes('npm_config') ||
      key.includes('npm_lifecycle') ||
      key.includes('npm_node') ||
      key.includes('npm_execpath') ||
      key === 'NODE_PATH' ||
      key === 'LESSOPEN' ||
      key === 'USER' ||
      key === 'SHLVL' ||
      key === 'MOTD_SHOWN' ||
      key === 'HOME' ||
      key === 'OLDPWD' ||
      key === 'YARN_WRAP_OUTPUT' ||
      key === 'WSL_DISTRO_NAME' ||
      key === 'LOGNAME' ||
      key === 'NAME' ||
      key === '_' ||
      key === 'TERM' ||
      key === 'PATH' ||
      key === 'NODE' ||
      key === 'LANG' ||
      key === 'LS_COLORS' ||
      key === 'SHELL' ||
      key === 'LESSCLOSE' ||
      key === 'PWD' ||
      key === 'XDG_DATA_DIRS' ||
      key === 'HOSTTYPE' ||
      key === 'INIT_CWD' ||
      key === 'WSLENV'
    ) {
      delete envVars[key];
    }
  }
}

const useCommonLayer = envVars.AWS_FUNCTION_USE_COMMON_LAYER
  ? envVars.AWS_FUNCTION_USE_COMMON_LAYER.toLowerCase()
  : 'true';

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
  const roots = ['./src', './source'];
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
                !file.toLowerCase().includes('.js') &&
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
  let tracingEnabled = envVars.AWS_API_TRACING_ENABLED || 'true';
  tracingEnabled = tracingEnabled.toLowerCase();
  tracingEnabled =
    tracingEnabled.charAt(0).toUpperCase() + tracingEnabled.slice(1);
  await appendTemplate(
    'Globals:\n' +
      '  Function:\n' +
      `    Timeout: ${envVars.AWS_FUNCTION_TIMEOUT || 3}\n` +
      `    MemorySize: ${envVars.AWS_FUNCTION_MEMORY_SIZE || 512}\n` +
      `    Tracing: ${envVars.AWS_FUNCTION_TRACING || 'Active'}\n` +
      '  Api:\n' +
      `    TracingEnabled: ${tracingEnabled}\n\n`
  );
};

const addMetadataToTemplate = async (entryPoints, functionName, realPath) => {
  if (entryPoints && entryPoints.length > 0) {
    const newEntries = [];
    for (let index = 0; index < entryPoints.length; index++) {
      const entryPoint = entryPoints[index];
      const name = `${functionName}${index}`;
      newEntries.push(name + '.js');
      allEntryPoints.push({
        name: `${name}`,
        value: `${realPath}/${entryPoint}`,
      });
    }
    const sEntryPoints = newEntries
      ?.map(
        (newEntry) =>
          `        - ${
            newEntry.includes('[') ? "'" + newEntry + "'" : newEntry
          }\n`
      )
      ?.join('');
    await appendTemplate(
      '    Metadata:\n' +
        '      BuildMethod: esbuild\n' +
        '      BuildProperties:\n' +
        `        Minify: ${envVars.AWS_FUNCTION_MINIFY || 'true'}\n` +
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
            !file.toLowerCase().includes('.js') &&
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
    envVars.AWS_FUNCTION_ARCHITECTURES || '["x86_64"]'
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
        `      CodeUri: ./dist\n` +
        `      Handler: ${functionName}0.default\n` +
        (JSON.parse(useCommonLayer)
          ? `      Layers:\n` + `        - !Ref CommonLayer\n`
          : '') +
        `      Runtime: ${envVars.AWS_FUNCTION_RUNTIME || 'nodejs16.x'}\n` +
        `      Environment:\n` +
        `        Variables:\n` +
        `          NODE_PATH: './:/opt/node_modules'\n` +
        Object.getOwnPropertyNames(envVars)
          .map(
            (key) =>
              `          ${key}: '${envVars[key].replaceAll('\n', '\\n')}'\n`
          )
          .join('') +
        `      Architectures:\n` +
        architectures +
        `      Events:\n`
    );
    await addMethodsToTemplate(functionName, path);
  } else {
    await addMetadataToTemplate(entryPoints, functionName, realPath);
  }
};

const initWebpackConfig = async () => {
  await writefil(
    './webpack.config.js',
    `const path = require('path');\n` +
      `const nodeExternals = require('webpack-node-externals');\n` +
      `module.exports = {\n` +
      `  mode: 'production',\n` +
      `  target: 'node16',\n` +
      `  devtool: 'inline-source-map',\n` +
      `  resolve: {\n` +
      `    modules: ['node_modules'],\n` +
      `  },\n` +
      `  module: {\n` +
      `    rules: [\n` +
      `      {\n` +
      `        test: /\.tsx?$/,\n` +
      `        use: 'ts-loader',\n` +
      `      },\n` +
      `    ],\n` +
      `  },\n` +
      `  resolve: {\n` +
      `    extensions: ['.tsx', '.ts', '.js'],\n` +
      `  },\n` +
      `  externalsPresets: { node: true },\n` +
      `  externals: [nodeExternals()],\n` +
      `  output: {\n` +
      `    path: path.resolve(__dirname, 'dist'),\n` +
      `    filename: '[name].js',\n` +
      `    library: {\n` +
      `      type: 'commonjs',\n` +
      `    },\n` +
      `  },\n`
  );
};

const closeWebpackConfig = async () => {
  await appendWebpackConfig(`};\n`);
};

const addEntriesToWebpackConfig = async () => {
  await appendWebpackConfig(
    `  entry: {\n` +
      allEntryPoints
        .map((entry) => `    ${entry.name}: '${entry.value}'`)
        .join(',\n') +
      `  },\n`
  );
};

const appendWebpackConfig = async (text) => {
  await appendfil('./webpack.config.js', text);
};

const generateWebpackConfig = async () => {
  await initWebpackConfig();
  await addEntriesToWebpackConfig();
  await closeWebpackConfig();
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
  ]);
  await generateWebpackConfig();
  if (JSON.parse(useCommonLayer))
    await appendTemplate(
      '\n' +
        `  CommonLayer:\n` +
        `    Type: AWS::Serverless::LayerVersion\n` +
        `    Properties:\n` +
        `      LayerName: common-dependencies\n` +
        `      Description: Common dependencies\n` +
        `      ContentUri: ./\n` +
        `      CompatibleRuntimes:\n` +
        `        - nodejs12.x\n` +
        `      LicenseInfo: 'MIT'\n` +
        `      RetentionPolicy: Retain\n`
    );
};

await execute();
