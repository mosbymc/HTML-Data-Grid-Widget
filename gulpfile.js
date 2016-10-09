'use strict';
var gulp = require('gulp'),
    args = require('yargs').argv,
    _ = require('gulp-load-plugins')({ lazy: true }),
    config = require('./gulp.config')(),
    del = require('del'),
    browserSync = require('browser-sync'),
    port = process.env.port || config.defaultPort;

gulp.task('help', _.taskListing);
gulp.task('default', ['help']);

gulp.task('plato', function(done) {
    var plato = require('plato');
    plato.inspect(config.build + 'scripts/grid.js', config.plato.report, config.plato.options, function noop(){
        done();
    });
});

gulp.task('yuidoc', ['clean-yuidoc'], function() {
    return gulp.src([config.gridJs])
        .pipe(_.yuidoc())
        .pipe(gulp.dest('./yuidoc/classes'));
});

gulp.task('clean-yuidoc', function(done) {
    clean('./yuidoc/**/*.*', done);
});

gulp.task('jsdoc', ['clean-jsdoc'], function() {
    return gulp.src(config.gridJs)
        .pipe(_.jsdoc('./jsdoc'));
});

gulp.task('clean-jsdoc', function(done) {
    clean([config.jsdoc], done);
});

gulp.task('esdoc', ['clean-esdoc'], function() {
    return gulp
        .src('./src/')
        .pipe(_.esdoc({
            destination: './esdoc',
            coverage: true
        }));
});

gulp.task('clean-esdoc', function(done) {
    clean(['./esdoc/**/*.*'], done);
});

gulp.task('lint', /*['plato'],*/ function() {
    log('Linting source with JSCS and JSHint.');
    return gulp
        .src(config.gridJs)
        .pipe(_.if(args.verbose, _.print()))
        .pipe(_.jshint())
        .pipe(_.jscs())
        .pipe(_.jscsStylish.combineWithHintResults())
        .pipe(_.jshint.reporter('jshint-stylish', { verbose: true }))
        .pipe(_.jshint.reporter('fail'));
});

gulp.task('jscs', ['lint'], function(done) {
    log('Linting source with JSCS and JSHint.');
    return gulp
        .src(config.gridJs)
        .pipe(_.if(args.verbose, _.print()))
        .pipe(_.jscs())
        .pipe(_.jscs.reporter('fail'));
});

gulp.task('styles', ['clean-styles'], function() {
    log('Compiling LESS -> CSS');
    return gulp
        .src(config.less)
        .pipe(_.less())
        .pipe(_.plumber())
        .pipe(_.autoprefixer({ browsers: ['last 3 version', '> 5%']}))
        .pipe(gulp.dest(config.dev + '/styles'))
        .pipe(gulp.dest(config.temp))
        .pipe(gulp.dest(config.build + 'styles'))
        .pipe(gulp.dest(config.source + 'styles'));
});

gulp.task('images', ['clean-images'], function() {
    log('Copying and compressing images');

    return gulp.src(config.images)
        .pipe(_.imagemin({optimizationLevel: 4}))
        .pipe(gulp.dest(config.build + 'images'))
        .pipe(gulp.dest(config.source + 'images'));
});

gulp.task('clean', function(done) {
    var deleteConfig = [].concat(config.build, config.temp, config.source);
    log('Cleaning: ' + _.util.colors.blue(deleteConfig));
    del(deleteConfig, done);
});

gulp.task('clean-styles', function(done) {
    clean([config.devCss, config.temp + '**/*.css', config.build + 'styles/**/*.css', config.source + 'styles/**/*.css'], done);
});

gulp.task('clean-images', function(done) {
    clean([config.build + 'images/**/*.*', config.source + 'images/**/*.*'], done);
});

gulp.task('clean-code', function(done) {
    clean([config.build + 'scripts/**/*.js', config.source + 'scripts/**/*.js'], done);
});

gulp.task('style-watcher', function() {
    gulp.watch([config.less], ['styles']);
});

gulp.task('optimize', ['minify-css', 'optimize-js', 'images'], function() {
    log('Optimizing JavaScript and CSS + compressing images!');
});

gulp.task('build', ['optimize'], function() {
    var plato = require('plato');
    plato.inspect(config.build + 'scripts/grid.js', config.plato.report, config.plato.options, function noop(){
        //done();
    });
});

gulp.task('minify-css', ['styles'], function() {
    log('Minifing CSS');

    return gulp.src(config.buildCss)
        .pipe(_.plumber())
        .pipe(_.csso())
        .pipe(gulp.dest(config.build + 'styles'))
        .pipe(gulp.dest(config.build + 'styles'));
});

gulp.task('optimize-js', ['lint', 'clean-code'], function() {
    log('Optimizing JavaScript');

    return gulp.src(config.gridJs)
        .pipe(_.plumber())
        .pipe(_.stripComments())
        .pipe(gulp.dest(config.build + 'scripts'))
        .pipe(gulp.dest(config.source + 'scripts'))
        .pipe(_.closureCompiler({
            compilerPath: 'C:\\ClosureCompiler\\compiler.jar',
            fileName: 'grid.min.js',
            compilerFlags: {
                compilation_level: 'SIMPLE_OPTIMIZATIONS',
                language_in: 'ECMASCRIPT5_STRICT',
                language_out: 'ECMASCRIPT5_STRICT',
                warning_level: 'DEFAULT',
                externs: ['./closureExterns.js'],
                create_source_map: 'D:\\Repo\\personal_projects\\grid\\build\\scripts\\grid.min.js'
            }
        }))
        .pipe(gulp.dest(config.build + 'scripts'))
        .pipe(gulp.dest(config.source + 'scripts'));
});

gulp.task('dev-server', ['styles'], function() {
    serve(true /*isDev*/);
});

gulp.task('build-server', ['optimize'], function() {
    serve(false /*isDev*/);
});

gulp.task('test', function(done) {
    startTests(done, true);
});

function serve(isDev) {
    return _.nodemon({
            script: config.nodeServer,
            delayTime: 1,
            env: {
                'PORT': port,
                'NODE_ENV': isDev ? 'dev' : 'build'
            },
            watch: [config.routes, config.dev + 'scripts/']
        })
        .on('restart', ['lint'], function(evt) {
            log('*** nodemon restarted ***');
            log('Files changed on restart:\n' + evt);
            setTimeout(function browserSyncDelayCallback() {
                browserSync.notify('reloading now ...');
                browserSync.reload({stream: false});
            }, config.browserReloadDelay);
        })
        .on('start', function() {
            log('*** nodemon started ***');
            startBrowserSync(isDev);
        })
        .on('crash', function() {
            log('*** nodemon crashed ***');
        })
        .on('exit', function() {
            log('*** nodemon exited cleanly ***');
        });
}

function startBrowserSync(isDev) {
    if (args.nosync || browserSync.active)  //gulp dev-server --nosync: prevents browser-sync from reloading on changes
        return;

    log ('Starting browser-sync on port: ' + port);

    if (isDev) {
        gulp.watch([config.less], ['styles'])
            .on('change', function (evt) {
                changeEvent(evt);
            });
    }
    else {
        gulp.watch([config.less, config.js], [browserSync.reload])
            .on('change', function(evt) {
                changeEvent(evt);
            });
    }

    browserSync({
        proxy: 'localhost:' + port + '/public/grid.html',
        port: 3030,
        files: isDev ? [
            config.dev + '**/*.*',
            config.temp + '**/*.*',
            config.routes + '**/*.*',
            '!' + config.less
        ] : [],
        ghostMode: {
            clicks: true,
            location: false,
            forms: true,
            scrolling: true
        },
        injectChanges: true,
        logFileChanges: true,
        logLevel: 'debug',
        logPrefix: 'gulp-browser-sync',
        notify: true,
        reloadDelay: 0
    });
}

function changeEvent(evt) {
    var sourcePattern = new RegExp('/.*(?=/' + config.dev + ')/');
    var tempPattern = new RegExp('/.*(?=/' + config.temp + ')/');
    var routePattern = new RegExp('/.*(?=/' + config.routes + ')/');
    var publicPattern = new RegExp('/.*(?=/' + config.dev + ')/');
    log('File ' + evt.path.replace(sourcePattern, '') + evt.path.replace(tempPattern, '') + evt.path.replace(routePattern, '') + evt.path.replace(publicPattern, '') + ' ' + evt.type);
}

function clean(path, done) {
    log('Cleaning ' + _.util.colors.blue(path));
    del(path).then(done());
}

function startTests(done, singleRun) {
    //del('./tests/report/coverage');
    //var qunit = require('node-qunit-phantomjs-istanbul');

    //qunit('./tests/unitTests/client/grid.test.html', { 'coverageLocation': config.qUnit.coverage }, done);
    var karma = require('karma').server;
    var excludedFiles = [];

    karma.start({
        configFile: __dirname + '/karma.conf.js',
        singleRun: !!singleRun,
        exclude: excludedFiles
    }, karmaCompleted);

    function karmaCompleted(karmaResult) {
        log('Karma Completed');
        if (karmaResult == 1)
            done('karma: test failed with result: ' + karmaResult);
        else
            done();
    }
}

function log(msg) {
    if (typeof msg === 'object') {
        for (var item in msg) {
            _.util.log(_.util.colors.blue(msg[item]));
        }
    }
    else {
        _.util.log(_.util.colors.blue(msg));
    }
}