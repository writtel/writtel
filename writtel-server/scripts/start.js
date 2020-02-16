const chalk = require('@writtel/cli-utils/chalk');
const {spawn} = require('child_process');
const path = require('path');
const detect = require('@writtel/cli-utils/detect-port');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('../config/webpack.config');
const chokidar = require('chokidar');
const debounce = require('lodash.debounce');

exports.usage = () => 'starts Writtel using the current directory as theme';

const spawnServer = (port, webpackPort) => {
  const server = spawn('node', [
    '-r',
    path.resolve(__dirname, '..', 'config', 'babel-server'),
    './src'
  ], {
    stdio: 'inherit',
    env: {
      ...process.env,
      WRITTEL_ASSETS_PORT: webpackPort,
      PORT: port,
    },
  });

  return server;
};

exports.script = async (...args) => {
  console.info(chalk.blue.bold('🚀 Starting Writtel'));

  const port = await detect(process.env.PORT || 3000);
  const webpackPort = await detect(10000);

  const webpackDevServer = new WebpackDevServer(webpack(config), {
    publicPath: config.output.publicPath,
    hot: true,
    inline: true,
    stats: { colors: true },
  });

  webpackDevServer.listen(webpackPort, 'localhost', (err) => {
    if (err) {
      console.error(err);
    }

    let server = spawnServer(port, webpackPort);

    const watcher = chokidar.watch(['.', path.resolve(__dirname, '..', 'lib')], {
      ignored: /node_modules/,
    });

    watcher.on('all', debounce((...args) => {
      console.info(...args);
      console.info('Restarting server...');
      server.kill('SIGTERM');
      server = spawnServer(port, webpackPort);
    }, 2000));

  });
};
