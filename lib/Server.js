import ws from 'ws';
import Splitter from 'stream-split';

const WebSocketServer = ws.Server;
const NALseparator = new Buffer([0, 0, 0, 1]);

class Server {
  constructor(server, options) {
    this.options = Object.assign({
      width: 960,
      height: 540
    }, options);

    this.wss = new WebSocketServer({ server });

    this.newClient = this.newClient.bind(this);
    this.startFeed = this.startFeed.bind(this);
    this.broadcast = this.broadcast.bind(this);

    this.wss.on('connection', this.newClient);
  }

  startFeed() {
    let readStream = this.getFeed();
    this.readStream = readStream;

    readStream = readStream.pipe(new Splitter(NALseparator));
    readStream.on('data', this.broadcast);
  }

  broadcast(data) {
    this.wss.clients.forEach(socket => {
      if (socket.buzy) return;

      socket.buzy = true;
      socket.buzy = false;

      socket.send(Buffer.concat([NALseparator, data]), { binary: true }, () => {
        socket.buzy = false;
      });
    });
  }

  newClient(socket) {
    const self = this;
    console.log('New guy');

    socket.send(JSON.stringify({
      action: 'init',
      width: this.options.width,
      height: this.options.height
    }));

    socket.on('message', (data) => {
      const action = data.split(' ')[0];
      console.log(`Incomming action: ${action}`);

      if (action === 'REQUESTSTREAM') self.startFeed();
      if (action === 'STOPSTREAM') self.readStream.pause();
    });

    socket.on('close', () => {
      self.readStream.end();
      console.log('stopping client interval');
    });
  }
}

export default Server;
