'use strict';

var fs            = require('fs'),
connectLiveReload = require('connect-livereload'),
LIVERELOAD_PORT   = 35729,
lrSnippet         = connectLiveReload({port: LIVERELOAD_PORT});


// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    // configurable paths
    var yeomanConfig = {
        app: 'src',
        dist: 'dist',
        doc: 'doc',
        test: 'test',
        demo: 'demo',
        coverage: 'test/coverage',
       instrumented: 'test/coverage/instrumented'
    };

    try {
        yeomanConfig.app = require('./bower.json').appPath || yeomanConfig.app;
    } catch (e) {}

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        yeoman: yeomanConfig,

        maven: {
            options: {
                goal:'install',
                groupId: 'org.appverse.web.framework.modules.frontend.html5',
                repositoryId: 'my-nexus',
                releaseRepository: 'url'

            },
            'install-src': {
                options: {
                    classifier: 'sources'
                },
                files: [{
                    expand: true,
                    cwd:'<%= yeoman.app %>/',
                    src: ['**','!bower_components/**'],
                    dest:'.'
                }]
            },
            'install-min': {
                options: {
                    classifier: 'min'
                },
                files: [{
                    expand: true,
                    cwd:'<%= yeoman.dist %>/',
                    src: ['**'],
                    dest:'.'
                }]
            },
            'deploy-src': {
                options: {
                    goal:'deploy',
                    url: '<%= releaseRepository %>',
                    classifier: 'sources'
                },
                files: [{
                    expand: true,
                    cwd:'<%= yeoman.app %>/',
                    src: ['**','!bower_components/**'],
                    dest:'.'
                }]
            },
            'deploy-min': {
                options: {
                    goal:'deploy',
                    url: '<%= releaseRepository %>',
                    classifier: 'min'
                },
                files: [{
                    expand: true,
                    cwd:'<%= yeoman.dist %>/',
                    src: ['**'],
                    dest:'.'
                }]
            }
        },

        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= yeoman.dist %>/**',
                        '!<%= yeoman.dist %>/.git*'
                    ]
                }]
            },
            coverage : 'coverage/*',
            server: '.tmp',
            docular: 'doc'

        },

        jshint: {
            options: {
                jshintrc: '.jshintrc',
                //Show failures but do not stop the task
                force: true
            },
            all: [
                '<%= yeoman.app %>/api-*/{,*/}*.js'
            ]
        },

        concat: {
            options: {
              sourceMap: true,
            },

            // Concatenate all files for a module in a single module file
            modules: {

                // Files using the same module are concatenated in the correct order:
                // · 1st, module.js files are loaded as these are the ones that create the module
                // · 2nd, provider.js files containing are loaded. This is because some modules use their own
                // providers in their config block. Because of this, providers must be loaded prior to config blocks.
                // · 3rd, rest of files
                files: {
                    '<%= yeoman.dist %>/api-cache/api-cache.js':
                        moduleFilesToConcat('<%= yeoman.app %>/api-cache'),

                    '<%= yeoman.dist %>/api-configuration/api-configuration.js' :
                        moduleFilesToConcat('<%= yeoman.app %>/api-configuration*'),

                    '<%= yeoman.dist %>/api-detection/api-detection.js' :
                        moduleFilesToConcat('<%= yeoman.app %>/api-detection', [
                            '<%= yeoman.app %>/api-detection/mobile-libraries-loader.provider.js',
                            '<%= yeoman.app %>/api-detection/mobile-detector.provider.js',
                            '<%= yeoman.app %>/api-detection/detection.provider.js',
                        ]),

                    '<%= yeoman.dist %>/api-logging/api-logging.js' :
                        moduleFilesToConcat('<%= yeoman.app %>/api-logging'),

                    '<%= yeoman.dist %>/api-main/api-main.js' :
                        moduleFilesToConcat('<%= yeoman.app %>/api-main'),

                    '<%= yeoman.dist %>/api-performance/api-performance.js' :
                        moduleFilesToConcat('<%= yeoman.app %>/api-performance'),

                    '<%= yeoman.dist %>/api-translate/api-translate.js' :
                        moduleFilesToConcat('<%= yeoman.app %>/api-translate'),

                    '<%= yeoman.dist %>/api-utils/api-utils.js' :
                        moduleFilesToConcat('<%= yeoman.app %>/api-utils'),

                    '<%= yeoman.dist %>/api-serverpush/api-serverpush.js' :
                        moduleFilesToConcat('<%= yeoman.app %>/{api-serverpush,api-socketio}'),

                    '<%= yeoman.dist %>/api-rest/api-rest.js' :
                        moduleFilesToConcat('<%= yeoman.app %>/api-rest'),
                }
            },

            // Concatenate all modules into a full distribution
            dist: {
                src: [
                    '<%= yeoman.dist %>/*/*.js',
                ],
                dest: '<%= yeoman.dist %>/appverse-html5-core.js',
            },
        },

        // ng-annotate tries to make the code safe for minification automatically
        // by using the Angular long form for dependency injection.
        ngAnnotate: {
          dist: {
            files: [{
              expand: true,
              cwd: '<%= yeoman.dist %>',
              src: ['**/*.js', '!oldieshim.js'],
              dest: '<%= yeoman.dist %>',
              extDot : 'last'
            }]
          }
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - */'
            },
            dist: {

                files: [{
                      expand: true,     // Enable dynamic expansion.
                      cwd: '<%= yeoman.dist %>',      // Src matches are relative to this path.
                      src: ['**/*.js'], // Actual pattern(s) to match.
                      dest: '<%= yeoman.dist %>',   // Destination path prefix.
                      ext: '.min.js',   // Dest filepaths will have this extension.
                      extDot: 'last'   // Extensions in filenames begin after the last dot
                    }
                ]
            }

        },


        karma: {
            unit: {
                configFile: '<%= yeoman.test %>/config/karma.unit.conf.js',
                autoWatch: false,
                singleRun: true
            },
            unitAutoWatch: {
                configFile: '<%= yeoman.test %>/config/karma.unit.watch.conf.js',
                autoWatch: true
            },
            midway: {
                configFile: '<%= yeoman.test %>/config/karma.midway.conf.js',
                autoWatch: false,
                singleRun: true
            },
        },

        docular: {
            showDocularDocs: false,
            showAngularDocs: true,
            docular_webapp_target: "doc",
            groups: [
                {
                    groupTitle: 'Appverse HTML5',
                    groupId: 'appverse',
                    groupIcon: 'icon-beer',
                    sections: [
                        {
                            id: "commonapi",
                            title: "Common API",
                            showSource: true,
                            scripts: ["src/modules", "src/directives"
                            ],
                            docs: ["ngdocs/commonapi"],
                            rank: {}
                        }
                    ]
                }, {
                    groupTitle: 'Angular jQM',
                    groupId: 'angular-jqm',
                    groupIcon: 'icon-mobile-phone',
                    sections: [
                        {
                            id: "jqmapi",
                            title: "API",
                            showSource: true,
                            scripts: ["src/angular-jqm.js"
                            ],
                            docs: ["ngdocs/jqmapi"],
                            rank: {}
                        }
                    ]
                }
            ]
        },

        bump: {
            options: {
              files: ['package.json', 'bower.json'],
              updateConfigs: [],
              commit: true,
              commitMessage: 'Release v%VERSION%',
              commitFiles: ['package.json','bower.json'],
              createTag: true,
              tagName: 'v%VERSION%',
              tagMessage: 'Version %VERSION%',
              push: true,
              pushTo: 'origin',
              gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d'
            }
        },

        connect: {
            options: {
                protocol: 'http',
                port: 9000,
                hostname: 'localhost',
                middleware: function (connect) {
                    return [
                        delayApiCalls,
                        lrSnippet,
                        mountFolder(connect, yeomanConfig.app),
                        mountFolder(connect, yeomanConfig.demo),
                        httpMethods
                    ];
                }
            },
            livereload: {
                options: {
                    port: 9000,
                }
            },
            e2e: {
                options: {
                    port: 9090,
                }
            },
            e2e_dist: {
                options: {
                    port: 9090,
                    middleware: function (connect) {
                        return [
                            delayApiCalls,
                            lrSnippet,
                            mountFolder(connect, yeomanConfig.app),
                            mountFolder(connect, yeomanConfig.dist),
                            mountFolder(connect, yeomanConfig.demo,{index: 'index-dist.html'}),
                            httpMethods
                        ];
                    }
                }
            }
        },

        watch: {
            livereload: {
                options: {
                    livereload: LIVERELOAD_PORT
                },
                files: [
                    '<%= yeoman.demo %>/**/*.html',
                    '<%= yeoman.demo %>/js/*.js',
                    '{.tmp,<%= yeoman.app %>}/**/*.js',
                ]
            }
        },

        open: {
            demo: {
                url: '<%= connect.options.protocol %>://<%= connect.options.hostname %>:<%= connect.options.port %>'
            },
        },

        exec: {
            protractor_start: 'npm run protractor',
            webdriver_update: 'npm run update-webdriver'
        },

        protractor_webdriver: {
            start: {
                options: {
                    command: 'node_modules/.bin/webdriver-manager start --standalone'
                }
            }
        },

    });

    // -- Load plugins --

    grunt.loadNpmTasks('grunt-docular');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-mocha');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-maven-deploy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-notify');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-protractor-webdriver');
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks('grunt-ng-annotate');

    // -- Register tasks --

    grunt.registerTask('default', [
        'dist'
    ]);

    grunt.registerTask('test', [
        'test:all'
    ]);

    grunt.registerTask('unit', [
        'test:unit:once'
    ]);

    grunt.registerTask('midway', [
        'test:midway'
    ]);

    grunt.registerTask('e2e', [
        'dist:make',
        'test:e2e_dist'
    ]);

    grunt.registerTask('dev', 'Tasks to run while developing', [
        // For now, only execute unit tests when a file changes?
        // midway and e2e are slow and do not give innmedate
        // feedback after a change
        'test:unit:watch'
    ]);

    grunt.registerTask('demo', 'Runs demo app', [
        'connect:livereload',
        'open:demo',
        'watch'
    ]);

    grunt.registerTask('doc', [
        'clean:docular',
        'docular'
    ]);

    grunt.registerTask('dist', [
        'jshint',
        'unit',
        'midway',
        'dist:make',
        'test:e2e_dist'
    ]);

    grunt.registerTask('install', [
        'clean',
        'maven:install-src',
        'dist',
        'maven:install-min'
    ]);

    grunt.registerTask('deploy', [
        'clean',
        'maven:deploy-src',
        'dist',
        'maven:deploy-min'
    ]);


    grunt.registerTask('dist:make', [
        'clean:dist',
        'concat',
        'ngAnnotate',
        'uglify'
    ]);

    grunt.registerTask('test:unit:watch', [
        'clean:coverage',
        'karma:unitAutoWatch'
    ]);

    grunt.registerTask('test:unit:once', [
        'clean:coverage',
        'karma:unit'
    ]);

    grunt.registerTask('test:midway', [
        'clean:coverage',
        'karma:midway'
    ]);

    grunt.registerTask('test:e2e', [
        'exec:webdriver_update',
        'connect:e2e',
        'protractor_webdriver',
        'exec:protractor_start',
    ]);

    grunt.registerTask('test:e2e_dist', [
        'exec:webdriver_update',
        'connect:e2e_dist',
        'protractor_webdriver',
        'exec:protractor_start',
    ]);

    grunt.registerTask('test:all', [
        'clean:coverage',
        'karma:unit',
        'karma:midway',
        'test:e2e',
    ]);

};


/////////////// Helper Methods


function mountFolder (connect, dir, options) {
    return connect.static(require('path').resolve(dir), options);
}

function delayApiCalls (request, response, next) {
    if (request.url.indexOf('/api') !== -1) {
        setTimeout(function () {
            next();
        }, 1000);
    } else {
        next();
    }
}

function httpMethods (request, response, next) {

    var rawpath = request.url.split('?')[0],
    path        = require('path').resolve(__dirname, 'demo/' + rawpath);

    console.log("request method: " + JSON.stringify(request.method));
    console.log("request url: " + JSON.stringify(request.url));
    console.log("request path : " + JSON.stringify(path));

    if ((request.method === 'PUT' || request.method === 'POST')) {
        console.log('inside put/post');
        request.content = '';
        request.addListener("data", function (chunk) {
            request.content += chunk;
        });

        request.addListener("end", function () {
            console.log("request content: " + JSON.stringify(request.content));
            if (fs.existsSync(path)) {
                fs.writeFile(path, request.content, function (err) {
                    if (err) {
                        throw err;
                    }
                    console.log('file saved');
                    response.end('file was saved');
                });
                return;
            }

            if (request.url === '/log') {
                var filePath = 'server/log/server.log';
                var logData = JSON.parse(request.content);
                fs.appendFile(filePath, logData.logUrl + '\n' + logData.logMessage + '\n', function (err) {
                    if (err) {
                        throw err;
                    }
                    console.log('log saved');
                    response.end('log was saved');
                });
                return;
            }
        });
        return;
    }
    next();
}


/**
 * Specify concat order to concant files from the same
 * module into a single module file
 *
 * @param  {string} moduleFolderPath
 * @param  {array} filesAfterModule Files to concat inmediately after the module
 * @return {array}                  List of files to concat
 */
function moduleFilesToConcat(moduleFolderPath, filesAfterModule) {

    //Remove trailing slash
    moduleFolderPath =  moduleFolderPath.replace(/\/+$/, '');

    // Module definition file is always loaded first
    var files = [moduleFolderPath + '/module.js'];

    if (typeof filesAfterModule === 'object') {
        files = files.concat(filesAfterModule);
    }

    return files.concat([
        moduleFolderPath + '/**/*.provider.js',
        moduleFolderPath +'/**/*.js'
    ]);
}
