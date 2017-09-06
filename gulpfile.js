const gulp = require('gulp');
const nodemon = require('nodemon');

gulp.task('default', function () {
    nodemon({
        script: 'server.js',
        ext: 'js',
        env: {
            PORT: 8080
        },
        ignore: ['./node_modules/**']
    }).on('restart', function(){
        console.log('Server refreshed');
    });
});