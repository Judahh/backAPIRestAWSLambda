#!/usr/bin/env node
import { chdir, cwd } from 'node:process';

const sImport = async (root, paths) => {
  const sImports = paths.map((path) => root + '/' + path);
  for (const sImport of sImports) {
    try {
      const imported = await import(sImport);
      return imported;
    } catch (error) {
      console.log(error);
    }
  }
};

// new SimpleApp(index.default.getInstance(), dBHandler.default);

const folderIndex = process.argv.indexOf('-f');
let folder;
if (folderIndex > -1) {
  // Retrieve the value after --custom
  folder = process.argv[folderIndex + 1];
}
console.log('Folder:', `${folder}`);
try {
  chdir(folder);
  global.__basedir = folder;
  console.log('Changed directory to:', `${cwd()}`);
  sImport('../../../..', [
    'dist/source/dBHandler.js',
    'source/dBHandler.js',
    'dist/src/dBHandler.js',
    'src/dBHandler.js',
  ]).then((dBHandler) => {
    sImport('../../../..', [
      'dist/source/route/index.js',
      'source/route/index.js',
      'dist/src/route/index.js',
      'src/route/index.js',
      'dist/source/routes/index.js',
      'source/routes/index.js',
      'dist/src/routes/index.js',
      'src/routes/index.js',
    ]).then((index) => {
      const rIndex = index?.default?.default;
      const instance = rIndex?.getInstance();
      const handler = dBHandler?.default?.default;
      console.log('index', rIndex);
      console.log('instance', instance);
      console.log('handler', handler);
      handler.migrate();
    });
  });
} catch (error) {
  console.log('Error changing directory:', `${error}`);
}
