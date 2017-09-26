import http from 'http';
import express from 'express';
import socketIo from 'socket.io';
import socketIoStream from 'socket.io-stream';
import fluentFfmpeg from 'fluent-ffmpeg';
import base64 from 'base64-stream';

// Constants
const port = 3000;

// fs.createReadStream('output.flv').pipe(stream);

const app = express();
const server = http.Server(app);
const io = socketIo(server);

server.listen(port);

app.use(express.static('public'))

app.get('/socket.io.js', function (req, res) {
  res.sendFile(__dirname + '/node_modules/socket.io-client/dist/socket.io.js');
});
app.get('/socket.io-stream.js', function (req, res) {
  res.sendFile(__dirname + '/node_modules/socket.io-stream/socket.io-stream.js');
});
app.get('/broadway-decoder.js', function (req, res) {
  res.sendFile(__dirname + '/vendor/broadway/Decoder.js');
});
app.get('/broadway-player.js', function (req, res) {
  res.sendFile(__dirname + '/vendor/broadway/Player.js');
});

io.on('connection', function (socket) {
  // socket.on('executeCommand', function (data) {
  //   console.log(data);
  // });
  //
  // socket.emit('streamPicture', { hello: 'world' });

  const stream = socketIoStream.createStream();
  // socketIoStream.forceBase64 = true;
  socketIoStream(socket).emit('streamVideo', stream);

  const ffmpeg = fluentFfmpeg();
  ffmpeg
  .input('video=screen-capture-recorder')
  .inputOptions([
    '-f dshow',
    '-framerate 20',
    // '-video_size 600x400',
    '-pix_fmt yuv420p',
    // '-c:v libx264',
    // '-b:v 600k',
    // '-bufsize 600k',
    // '-tune zerolatency',
    '-vprofile baseline'
  ])
  .on('error', function(err) {
    console.log('An error occurred: ' + err.message);
  })
  .on('end', function() {
    console.log('Streaming finished');
  })
  .format('rawvideo')
  .videoCodec('libx264')
  .pipe(stream);
  // .output('video.avi')
  // .run();
});

console.log(`SERVER LISTENTING ON PORT: ${port}`)
