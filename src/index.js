import express from 'express';
import http from 'http'
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import { Network } from './network/network.js';
import webpack from 'webpack';
import webpackConfig from '../webpack.dev.js';
import webpackDevMiddleware from 'webpack-dev-middleware';

const app = express();
const server = http.createServer(app);
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000,  transports: ["websocket"]  });

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);


app.use(express.json());

if (process.env.NODE_ENV === 'development') {

  const compiler = webpack(webpackConfig);
  app.use(webpackDevMiddleware(compiler));
} else {
 
  app.use(express.static(path.join(__dirname, '../dist')));
}

const port = process.env.PORT || 8080;

server.listen(port, () => {
  console.log(`Serwer działa na porcie: ${port}`);
});


const network = new Network(io);


