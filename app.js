import http from 'http';
import path from 'path';
import express from 'express';
import socketIo from 'socket.io';
import socketIoStream from 'socket.io-stream';
import fluentFfmpeg from 'fluent-ffmpeg';
import Splitter from 'stream-split';

// Constants
const port = 3000;
const NALseparator = new Buffer([0, 0, 0, 1]);

// fs.createReadStream('output.flv').pipe(stream);

const app = express();
const server = http.Server(app);
const io = socketIo(server);

server.listen(port);

app.use(express.static('public'));

app.get('/socket.io.js', (req, res) => {
  res.sendFile(path.join(__dirname, '/node_modules/socket.io-client/dist/socket.io.js'));
});
app.get('/socket.io-stream.js', (req, res) => {
  res.sendFile(path.join(__dirname, '/node_modules/socket.io-stream/socket.io-stream.js'));
});
app.get('/broadway-decoder.js', (req, res) => {
  res.sendFile(path.join(__dirname, '/vendor/broadway/Decoder.js'));
});
app.get('/broadway-player.js', (req, res) => {
  res.sendFile(path.join(__dirname, '/vendor/broadway/Player.js'));
});

io.on('connection', (socket) => {
  // socket.on('executeCommand', function (data) {
  //   console.log(data);
  // });
  //
  // socket.emit('streamPicture', { hello: 'world' });

  const stream = socketIoStream.createStream();
  stream.pipe(new Splitter(NALseparator));
  socketIoStream(socket).emit('streamVideo', stream);

  const ffmpeg = fluentFfmpeg();
  ffmpeg
  .input('title=Atom')
  .inputOptions([
    '-f gdigrab',
    '-framerate 20'
    // '-video_size 600x400',
    // '-pix_fmt yuv420p',
    // '-c:v libx264',
    // '-vprofile baseline',
    // '-tune zerolatency'
  ])
  .on('error', err => console.log(`An error occurred: ${err.message}`))
  .on('end', () => console.log('Streaming finished'))
  .format('rawvideo')
  .videoCodec('libx264')
  .pipe(stream);

  // .output('video.flv')
  // .run();
});

console.log(`SERVER LISTENTING ON PORT: ${port}`);
