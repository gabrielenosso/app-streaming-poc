# INSTALLATION
Install the building tools (Python included) with `npm --add-python-to-path='true' --debug install --global windows-build-tools`.
Then run `npm install`.


Install ffpmeg: download it and add its `bin` folder to the PATH.
Install https://github.com/rdp/screen-capture-recorder-to-video-windows-free.

Share screen
ffmpeg -f dshow -i video="screen-capture-recorder" output.flv

Share single process
ffmpeg -f gdigrab -framerate 30 -i title="german.avi - VLC media player" -b:v 3M  germ.flv
where "title" means actual title of a target window.


If it says that can't find CL.exe:
`npm config set msvs_version 2013 --global`
