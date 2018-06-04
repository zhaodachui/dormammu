// import { spawn } from 'child_process';
const {spawnSync} = require('child_process');
// console.log(aaa);
// const spawn = childProcess.sp

const minimist = require('minimist');
const path = require('path');
const fse = require('fs-extra');
const pathExists = require('path-exists');

const packageName = 'react-native-scripts';

const argv = minimist(process.argv.slice(2));
const commands = argv._;

const packageManager = argv['package-manager'];
const version = argv['script-version'];

async function createApp(name, version){
  const root = path.resolve(name);
  const appName = path.basename(name);

  const packageToInstall = getInstallPackage(version);
  // const pakageName = 'react-native-scripts';
  
  if(!pathExists(name)){
    fse.mkdir(root);
  }

  const packageJson = {
    name: appName,
    version: '0.1.0'
  }

  await fse.writeFile(path.join(root, 'package.json'), JSON.stringify(packageJson, null, 2));
  process.chdir(root);

  install(root, appName, packageToInstall);
}

async function install(root, appName, packageToInstall){
  const type = packageManagerType();
  // const cmd = packageManagerCmd();
  if(type === 'yarn'){
    args = ['add', '--dev', '--exact', '--ignore-optional', packageToInstall];
  } else {
    args = ['install', '--save-dev', '--save-exact', packageToInstall];
  }
  result = spawnSync(type, args, {stdio: 'inherit'});
  if(result.error || result.status !== 0){
    console.error(`${commond} ${args.join('  ')} failed`);
    return ;
  }

  const scriptsPath = path.resolve(process.cwd(),'node_modules', packageName ,'build/scripts/init.js');
  const init = require(scriptsPath);
  await init(root, appName, true, type);
}

createApp(commands[0], version).then(() => {});

function getInstallPackage(version){
  let packageToInstall = packageName;
  if(version){
    packageToInstall += `@${version}`;
  }
  return packageToInstall;
}

function packageManagerType() {
  const defaultPackageManager = 'npm';
  const supportedTypes = ['npm', 'cnpm', 'yarn'];
  if(packageManager){
    const index = supportedTypes.indexOf(packageManager);
    index === -1 ? defaultPackageManager: packageManager
  }
  return userHasYarn() ? 'yarn' : defaultPackageManager;
}

function packageManagerCmd() {
  if (packageManager) {
    return packageManager;
  } else {
    return packageManagerType() === 'yarn' ? 'yarnpkg' : 'npm';
  }
}

function userHasYarn(){
  try{
    const result = spawnSync('yarnpkg', ['--version'], {stdio: 'ignore'});
    if(result.error || result.status !==0){
      return false;
    }
    return true;
  } catch(error){
    return false;
  }
}