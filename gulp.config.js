module.exports = function _gulpConfig() {
    'use strict';
    var build = './build/';
    var source = './src/';
    var dev = './dev/';
    var tests = './tests/';

    return {
        buildJs: build + 'scripts/grid.js',
        buildCss: build + 'styles/grid.css',
        devCss: dev + 'styles/grid.css',
        build: build,
        source: source,
        buildFiles: [build + 'styles', build + 'scripts'],
        sourceFiles: [source + 'styles', source + 'scripts'],
        gridJs: dev + 'scripts/grid.js',
        images: dev + 'images/**/*.*',
        temp: './.tmp/',
        routes: './routes/',
        dev: dev,
        jsdoc: './jsdoc/**/*.*',
        plato: {
            report: './plato',
            options: {
                title: 'grid-plato',
                jshint: __dirname + '/.jshintrc'
            }
        },
        js: [
            dev + '**/*.js',
            './*.js',
            '!./closureExterns.js',
            '!./karma.conf.js'
        ],     //Javascript file to lint
        less: dev + 'styles/grid.less',
        defaultPort: 3000,
        nodeServer: './app.js',
        browserReloadDelay: 1000,
        qUnit: {
            files: [
                './tests/unitTests/client/grid.test.html',
                './tests/unitTests/client/multi-grid.test.html'
            ],
            coverage: './tests/report/coverage'
        },
        karma: {
            files: [
                './tests/unitTests/client/grid.test.html',
                './tests/unitTests/client/jquery-1.11.1.js',
                './src/scripts/grid.js',
                './tests/unitTests/client/gridData.test.js'
            ],
            coverage: {
                dir: tests + 'report/coverage',
                reporters: [
                    {
                        type: 'html',
                        subdir: 'report-html'
                    },
                    {
                        type: 'lcov',
                        subdir: 'report-lcov'
                    },
                    {
                        type: 'text-summary'
                    }
                ]
            }
        }
    };
};