import WrittelServer from '@writtel/server';
import DefaultTemplate from './default';
import {CategoryPage} from './categories';

const server = new WrittelServer();
server.addTemplate('default', DefaultTemplate);
server.setDefaultTemplate('default');
server.route('/categories/:slug', CategoryPage);
server.start();
