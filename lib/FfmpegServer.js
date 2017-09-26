import childProcess from 'child_process';
import Server from './Server';

const spawn = childProcess.spawn;

class FFMpegServer extends Server {

  constructor(server, opts) {
    super(server, Object.assign({
      fps: 15
    }, opts));
  }

  getFeed() {
    // Spawn application
    // spawn('C:\Program Files\X-Rite\Nucleos\Desktop\Nucleos Desktop.exe');

    const args = [
      '-f', 'gdigrab',
      '-draw_mouse', 0,
      '-framerate', this.options.fps,
      // '-offset_x', 10,
      // '-offset_y', 20,
      '-video_size', this.options.width + 'x' + this.options.height,
      '-i', 'title=Task Manager',
      '-pix_fmt', 'yuv420p',
      '-c:v', 'libx264',
      '-vprofile', 'baseline',
      '-tune', 'zerolatency',
      '-f', 'rawvideo',
      '-'
    ];

    console.log('ffmpeg ' + args.join(' '));
    const streamer = spawn('ffmpeg', args);
    streamer.on('exit', (code) => {
      console.log('Failure', code);
    });

    return streamer.stdout;
  }
}

export default FFMpegServer;
