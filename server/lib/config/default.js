const config = {
    rtmp_server: {
        logType: 3,
        rtmp: {
            port: 1935,
            chunk_size: 60000,
            gop_cache: true,
            ping: 30,
            ping_timeout: 60,
        },
        http: {
            port: 8888,
            allow_origin: '*',
            mediaroot: './media',
        },
        trans: {
            ffmpeg: '/usr/bin/ffmpeg',
            tasks: [
                {
                    app: 'live',
                    mkv: true,
                    // hls: true,
                    // hlsFlags: '[hls_time=1:hls_list_size=5:hls_flags=delete_segments]',
                    // dash: true,
                    // dashFlags: '[f=dash:window_size=3:extra_window_size=5]',
                    // mp4: true,
                    // mp4Flags: '[movflags=faststart]',
                },
            ],
        },
    },
};

module.exports = config;
