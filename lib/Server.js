import ws from 'ws';
import robot from 'robotjs';
import Splitter from 'stream-split';

const WebSocketServer = ws.Server;
const NALseparator = new Buffer([0, 0, 0, 1]);
const windowAppBarHeight = 29;

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
      const messageParts = data.split(' ');
      const action = messageParts[0];
      console.log(`Incoming action: ${action}`);

      if (action === 'REQUESTSTREAM') self.startFeed();
      if (action === 'STOPSTREAM') self.readStream.pause();
      if (action === 'INPUT') {
        const input = {
          type: messageParts[1],
          position: {
            x: parseInt(messageParts[2]),
            y: parseInt(messageParts[3]) + windowAppBarHeight
          }
        };
        console.log(`Input ${input.type} (${input.position.x},${input.position.y})`);
        robot.moveMouse(input.position.x, input.position.y);
        robot.mouseClick();
      }
    });

    socket.on('close', () => {
      self.readStream.end();
      console.log('stopping client interval');
    });
  }
}

export default Server;
