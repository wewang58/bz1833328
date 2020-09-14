var gulp        = require('gulp');
var browserSync = require('browser-sync').create();
var reload      = browserSync.reload;
const config = require('./config');
var request = require('request');

// Static server
gulp.task('browser-sync', function() {
    browserSync.init({
	watch: false,
    server: config.serverPath,
    socket: {
        path: '/visionapp/browser-sync/socket.io'
    },
    middleware: [
    	function (req, res, next) {
        	res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      	  	res.setHeader('Pragma', 'no-cache');
      	  	res.setHeader('Expires', '0');
            next();
        }
    ],
	ghostMode: {
    		   clicks: true,
    		   forms: true,
    		   scroll: true,
		       location: true
	},
    port: config.app.port,
    ui: {
        port: config.app.configPort
    },
	notify: false
    }, function(err, browserSync) {
        browserSync.io.sockets.on('connection', function(socket) {
            socket.on('custom-event', function (e) {
                console.log('Event: ' + e);

                var eventData = JSON.parse(e);

                console.log('api: ' + config.visionAPIHost + ':' + config.visionAPIPort + config.customerTimezoneAPI);

                request.post(config.visionAPIHost + ':' + config.visionAPIPort + config.customerTimezoneAPI, {
                    json: {
                        customerInteractionId: eventData.id,
                        timezone: eventData.timezone
                    }
                }, (error, res, body) => {
                    if (error) {
                        console.error(error);
                        return;
                    }
                    console.log('status code: ' + res.statusCode);
                })
            });
        });
    });

    browserSync.watch(config.serverPath + '/**', (event, e) => {
        if (event === 'change') {

            console.log('path is : ' + e);

            var splitStr = e.split("/");
            var fName =  splitStr[splitStr.length-1].replace('.html', '');

            console.log('file name is : ' + fName);

            var toEmit = fName.substring(0,5) + fName.substring(31);

            console.log('toEmit: '+ toEmit);

            browserSync.sockets.emit('custom-event', {val: toEmit});
            console.log('custom event emitted');
        }
    });

});

gulp.task('default', ['browser-sync']);
