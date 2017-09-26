import http from 'http';
import express from 'express';
import Server from './lib/FfmpegServer';

// Constants
const port = 3000;

const app = express();

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/vendor'));

const server = http.Server(app);
const streamServer = new Server(server, {
  width: 640,
  height: 480
});

server.listen(port);
console.log(`SERVER LISTENTING ON PORT: ${port}`);
