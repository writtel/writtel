#!/usr/bin/env node

const chalk = require('@writtel/cli-utils/chalk');
const glob = require('@writtel/cli-utils/glob');
const path = require('path');

const resolve = (script) => {
  try {
    return require.resolve(script);
  } catch (err) {
    return null;
  }
};

const getScripts = () => {
  const scripts = glob.sync('../scripts/*.js', {cwd: __dirname})
    .map(script => {
      const mod = require(script);
      const name = path.basename(script, '.js');
      const usage = mod.usage();
      return {
        name,
        usage
      };
    })
  return scripts;
}

const printUsage = () => {
  console.info(chalk.blue.bold(`  usage: writtel {script} [...options]`));
  console.info(chalk.blue(`  where {script} is:`))
  getScripts().forEach(script => {
    console.info(chalk.blue(`    ${script.name}`), chalk.gray(`- ${script.usage}`));
  });
}

const script = process.argv[2];

if (!script || script === 'help' || script === 'usage') {
  console.info();
  printUsage();
  console.info();
  process.exit(0);
}

const scriptModule = resolve(`../scripts/${script}`);

if (!scriptModule) {
  console.info();
  console.info(chalk.yellow(`writtel: script ${chalk.bold(script)} not found`));
  console.info();
  printUsage();
  console.info();
  process.exit(1);
}
require(scriptModule).script(...process.argv.slice(3));
