import express from 'express';
import http from 'http'
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';

import { Game } from './game/game.js';
import { Network } from './network/network.js';
import { GameMap } from './game/gameMap.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 });

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));
app.use(express.json());

//  app.use(express.static('dist'));

const port = process.env.PORT || 8080;

server.listen(port, () => {
  console.log(`Serwer działa na porcie: ${port}`);
});


const game = new Game(5, new GameMap(100, 100));

const network = new Network(io, game);

let lastUpdateTime = 0;

setInterval(() => {
  const currentTime = performance.now();
  const deltaTime = currentTime - lastUpdateTime;
  lastUpdateTime = currentTime;


  game.update(deltaTime);

  network.sendGameUpdate(currentTime);
  
}, 15);