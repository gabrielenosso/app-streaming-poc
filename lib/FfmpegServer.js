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
    spawn('"C:\\Program Files\\X-Rite\\Pantora-1.1.2.6449RC\\PANTORA.exe"', [], { shell: true });

    // const command = 'ffmpeg -f gdigrab -draw_mouse 0 -framerate 15 -video_size 960x720 -i title="PANTORA - Internal use only" -pix_fmt yuv420p -c:v libx264 -vprofile baseline -tune zerolatency -f rawvideo -';
    // const command = 'ffmpeg -f gdigrab -framerate 20 -i title="Task Manager" -vcodec libx264 -f h264 -';
    // const command = 'ffmpeg -f gdigrab -y -i title="Task Manager" -r 30000/1001 -b:a 2M -bt 4M -vcodec libx264 -pass 1 -coder 0 -bf 0 -flags -loop -wpredp 0 -an -f h264 -';
    const command = 'ffmpeg -f gdigrab -draw_mouse 0 -framerate 15 -video_size 1920x1000 -i title="PANTORA - Internal use only" -pix_fmt yuv420p -c:v libx264 -vprofile baseline -tune zerolatency -f rawvideo -vf pad="width=1920:height=1080:x=0:y=0:color=black" -';

    console.log(command);
    const streamer = spawn(command, [], { shell: true });
    streamer.on('exit', (code) => {
      console.log('Failure: ', code);
    });

    return streamer.stdout;
  }
}

export default FFMpegServer;
