import * as http from 'http';

let modules, alias;

/**
 * Default entry point for the lnk command line tool
 * @param {String[]} argv command line arguments
 * @return {void}
 */
export default function(argv) {
  const item = argv._[1];

  loadConfig()
    .then(({modules, alias}) => {
      switch (item) {
        case undefined:
          if (argv.packages) {
            return showPackages(modules);
          } else {
            return showModules(modules);
          }
        default:
          return showModule(modules, alias, item);
      }
    })
    .catch(err => console.log('ERROR:', err));
}

/**
 * @return {Promise}
 */
function loadConfig() {
  return new Promise((resolve, reject) => {
    http
      .get(`http://localhost:8080/o/js_loader_modules`, res => {
        try {
          const {statusCode} = res;

          if (statusCode !== 200) {
            throw new Error('HTTP error: ' + statusCode);
          }

          let data = '';
          res.on('error', reject);
          res.on('data', chunk => (data += chunk));
          res.on('end', () => {
            let Liferay = {};
            eval(data);
            let modules = Liferay.MODULES;
            let alias = Liferay.MAPS;
            resolve({
              modules,
              alias,
            });
          });
        } catch (err) {
          reject(err);
        }
      })
      .on('error', reject);
  });
}

/**
 * @param {Array} modules
 * @return {void}
 */
function showModules(modules) {
  for (let moduleName of Object.keys(modules).sort()) {
    console.log(moduleName);
  }
}

/**
 * @param {Array} modules
 * @return {void}
 */
function showPackages(modules) {
  let packageNames = {};

  for (let moduleName of Object.keys(modules)) {
    const i = moduleName.indexOf('/');
    const packageName = moduleName.substring(0, i);
    packageNames[packageName] = packageName;
  }

  packageNames = Object.keys(packageNames);

  for (let packageName of packageNames.sort()) {
    console.log(packageName);
  }
}

/**
 * @param {Array} modules
 * @param {Array} alias
 * @param {String} moduleName
 * @return {void}
 */
function showModule(modules, alias, moduleName) {
  console.log('');
  printDependencyTree(modules, alias, moduleName, 0);
  console.log('');
}

/**
 * @param {Array} modules
 * @param {Array} alias
 * @param {String} moduleName
 * @param {int} indent
 * @return {void}
 */
function printDependencyTree(modules, alias, moduleName, indent) {
  let aliasedModule = alias[moduleName];
  if (aliasedModule && aliasedModule.exactMatch) {
    moduleName = aliasedModule.value;
  }

  let tabs = '';
  for (let i = 0; i < indent; i++) {
    tabs += ' ';
  }

  console.log(tabs + moduleName);

  const {dependencies, map} = modules[moduleName];
  let deps = [];

  const moduleFolder = moduleName.substring(0, moduleName.lastIndexOf('/'));

  for (let dependency of dependencies) {
    if (dependency.indexOf('./') == 0) {
      dependency = moduleFolder + dependency.substr(1);
      deps.push(dependency);
    }
  }

  for (let entry of Object.values(map)) {
    deps.push(entry);
  }

  for (let dep of deps) {
    printDependencyTree(modules, alias, dep, indent + 4);
  }
}
