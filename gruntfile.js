/*jshint node:true */

'use strict';

var bowerFile = require('./bower.json');

module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Configurable paths
    var configPaths = {
        src: 'src',
        bowerComponents: 'bower_components',
        dist: 'dist',
        doc: 'doc',
        test: 'test',
        testsConfig: 'config/test',
        reports: 'reports'
    };

    // If app path is defined in bower.json, use it
    try {
        configPaths.src = bowerFile.appPath || configPaths.src;
    } catch (e) {}

    // Start Grunt config definition
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        // Project settings
        appverse: configPaths,

        maven: {
            options: {
                goal: 'install',
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
                    cwd: '<%= appverse.src %>/',
                    src: ['**', '!bower_components/**'],
                    dest: '.'
                }]
            },
            'install-min': {
                options: {
                    classifier: 'min'
                },
                files: [{
                    expand: true,
                    cwd: '<%= appverse.dist %>/',
                    src: ['**'],
                    dest: '.'
                }]
            },
            'deploy-src': {
                options: {
                    goal: 'deploy',
                    url: '<%= releaseRepository %>',
                    classifier: 'sources'
                },
                files: [{
                    expand: true,
                    cwd: '<%= appverse.src %>/',
                    src: ['**', '!bower_components/**'],
                    dest: '.'
                }]
            },
            'deploy-min': {
                options: {
                    goal: 'deploy',
                    url: '<%= releaseRepository %>',
                    classifier: 'min'
                },
                files: [{
                    expand: true,
                    cwd: '<%= appverse.dist %>/',
                    src: ['**'],
                    dest: '.'
                }]
            }
        },

        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= appverse.dist %>/**',
                        '!<%= appverse.dist %>/.git*'
                    ]
                }]
            },
            reports: '<%= appverse.reports %>',
            server: '.tmp',
            doc: 'doc/' + bowerFile.version
        },

        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish'),
                //Show failures but do not stop the task
                force: true
            },
            all: [
                '<%= appverse.src %>/{,*/}*.js'
            ]
        },

        // concatenate source files
        concat: {

            // Concatenate all files for a module in a single module file
            modules: {
                files: [{
                    src: [
                        '<%= appverse.src %>/appverse-configuration-default/**/module.js',
                        '<%= appverse.src %>/appverse-configuration-loader/**/module.js',
                        '<%= appverse.src %>/appverse-configuration/**/module.js',
                        '<%= appverse.src %>/appverse/**/module.js',
                        '<%= appverse.src %>/appverse-configuration-loader/**/*.js',
                        '<%= appverse.src %>/appverse-configuration-default/**/*.js',
                        '<%= appverse.src %>/appverse/**/*.js'
                    ],
                    dest: '<%= appverse.dist %>/appverse/appverse.js'
                }, {
                    src: [
                        '<%= appverse.src %>/appverse-cache/**/module.js',
                        '<%= appverse.src %>/appverse-cache/**/*.js'
                    ],
                    dest: '<%= appverse.dist %>/appverse-cache/appverse-cache.js'
                }, {
                    src: [
                        '<%= appverse.src %>/appverse-detection/**/module.js',
                        '<%= appverse.src %>/appverse-detection/**/*.js'
                    ],
                    dest: '<%= appverse.dist %>/appverse-detection/appverse-detection.js'
                }, {
                    src: [
                        '<%= appverse.src %>/appverse-ionic/**/module.js',
                        '<%= appverse.src %>/appverse-ionic/**/*.js'
                    ],
                    dest: '<%= appverse.dist %>/appverse-ionic/appverse-ionic.js'
                }, {
                    src: [
                        '<%= appverse.src %>/appverse-logging/**/module.js',
                        '<%= appverse.src %>/appverse-logging/**/*.js'
                    ],
                    dest: '<%= appverse.dist %>/appverse-logging/appverse-logging.js'
                }, {
                    src: [
                        '<%= appverse.src %>/appverse-native/**/module.js',
                        '<%= appverse.src %>/appverse-native/**/*.js'
                    ],
                    dest: '<%= appverse.dist %>/appverse-native/appverse-native.js'
                }, {
                    src: [
                        '<%= appverse.src %>/appverse-performance/**/module.js',
                        '<%= appverse.src %>/appverse-performance/**/*.js'
                    ],
                    dest: '<%= appverse.dist %>/appverse-performance/appverse-performance.js'
                }, {
                    src: [
                        '<%= appverse.src %>/appverse-rest/**/module.js',
                        '<%= appverse.src %>/appverse-rest/**/*.js'
                    ],
                    dest: '<%= appverse.dist %>/appverse-rest/appverse-rest.js'
                }, {
                    src: [
                        '<%= appverse.src %>/appverse-router/**/module.js',
                        '<%= appverse.src %>/appverse-router/**/*.js'
                    ],
                    dest: '<%= appverse.dist %>/appverse-router/appverse-router.js'
                }, {
                    src: [
                        '<%= appverse.src %>/appverse-serverpush/**/module.js',
                        '<%= appverse.src %>/appverse-serverpush/**/*.js'
                    ],
                    dest: '<%= appverse.dist %>/appverse-serverpush/appverse-serverpush.js'
                }, {
                    src: [
                        '<%= appverse.src %>/appverse-socketio/**/module.js',
                        '<%= appverse.src %>/appverse-socketio/**/*.js'
                    ],
                    dest: '<%= appverse.dist %>/appverse-socketio/appverse-socketio.js'
                }, {
                    src: [
                        '<%= appverse.src %>/appverse-translate/**/module.js',
                        '<%= appverse.src %>/appverse-translate/**/*.js'
                    ],
                    dest: '<%= appverse.dist %>/appverse-translate/appverse-translate.js'
                }, {
                    src: [
                        '<%= appverse.src %>/appverse-utils/**/module.js',
                        '<%= appverse.src %>/appverse-utils/base-url*',
                        '<%= appverse.src %>/appverse-utils/moduleseeker*',
                        '<%= appverse.src %>/appverse-utils/**/*.js'
                    ],
                    dest: '<%= appverse.dist %>/appverse-utils/appverse-utils.js'
                }]
            },

            // Concatenate all modules into a full distribution
            dist: {
                src: [
                    '<%= appverse.dist %>/*/*.js',
                ],
                dest: '<%= appverse.dist %>/appverse-html5-core.js',
            },
        },

        // ng-annotate tries to make the code safe for minification automatically
        // by using the Angular long form for dependency injection.
        ngAnnotate: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= appverse.dist %>',
                    src: '**/*.js',
                    dest: '<%= appverse.dist %>',
                }]
            }
        },

        // Uglifies already concatenated files
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - */',
                sourceMap: true,
            },
            dist: {
                files: [{
                    expand: true, // Enable dynamic expansion.
                    cwd: '<%= appverse.dist %>', // Src matches are relative to this path.
                    src: ['**/*.js'], // Actual pattern(s) to match.
                    dest: '<%= appverse.dist %>', // Destination path prefix.
                    ext: '.min.js', // Dest filepaths will have this extension.
                    extDot: 'last' // Extensions in filenames begin after the last dot
                }]
            }
        },

        karma: {
            options: {
                configFile: '<%= appverse.testsConfig %>/karma.unit.conf.js'
            },
            unit: {
                autoWatch: false,
                singleRun: true
            },
            'unit-watch': {
                autoWatch: true
            }
        },

        // Web server
        connect: {

            // General options
            options: {
                protocol: 'http',
                port: 9000,
                hostname: 'localhost'
            },

            // Docs
            doc: {
                options: {
                    port: 9999,
                    livereload: true,
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, configPaths.doc)
                        ];
                    }
                }
            },
        },

        // Generate code analysis reports
        plato: {
            main: {
                options: {
                    jshint: grunt.file.readJSON('.jshintrc')
                },
                files: {
                    '<%= appverse.reports %>/analysis/': [
                        '<%= appverse.src %>/**/*.js',
                        '<%= appverse.test %>/unit/**/*.js'
                    ]
                }
            }
        },

        concurrent: {
            dist: ['jshint', 'html2js']
        },

        html2js: {
            options: {
                htmlmin: {
                    removeComments: true,
                    removeCommentsFromCDATA: true,
                    removeCDATASectionsFromCDATA: true,
                    collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeAttributeQuotes: false,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true,
                    keepClosingSlash: true,
                },
                singleModule: true,
                quoteChar: '\'',
                useStrict: true,
                module: 'appverse.ionic.templates',
                fileHeaderString: '/*jshint -W101 */'
            },
            main: {
                src: 'src/appverse-ionic/**/*.html',
                dest: 'src/appverse-ionic/templates.js'
            }
        },

        watch: {
            dist: {
                files: ['src/**'],
                tasks: ['dist']
            },
            doc: {
                options: {
                    livereload: true
                },
                files: ['src/**', 'config/grunt-tasks/docgen/**'],
                tasks: ['doc']
            }
        },

        sonarVersion: {
            default: {
                options: {
                    field: 'sonar.projectVersion'
                },
                src: 'sonar-project.properties',
                dest: 'sonar-project.properties'
            }
        },

        release: {
            options: {
                bump: true, //default: true
                changelog: false, //default: false
                changelogText: '<%= version %>\n', //default: '### <%= version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n'
                file: 'package.json', //default: package.json
                add: true, //default: true
                commit: true, //default: true
                commitMessage: '<%= version %>', //default: 'release <%= version %>'
                tag: true, //default: true
                tagName: 'v<%= version %>', //default: true
                push: false, //default: true
                pushTags: false, //default: true
                npm: false, //default: true
                npmtag: false, //default: no tag
                afterBump: ['sonarVersion', 'dist']
            }
        }

    });

    /*---------------------------------------- TASKS DEFINITION -------------------------------------*/

    grunt.registerTask('default', [
        'dist'
    ]);

    grunt.registerTask('dist', [
        'clean:dist',
        'concurrent:dist',
        'concat',
        'ngAnnotate',
        'uglify'
    ]);

    grunt.registerTask('dist:watch', [
        'dist',
        'watch:dist'
    ]);

    grunt.registerTask('test', [
        'clean:reports',
        'karma:unit-watch'
    ]);

    grunt.registerTask('test:unit', [
        'clean:reports',
        'karma:unit'
    ]);

    grunt.registerTask('docgen', 'Generates docs', require('./config/grunt-tasks/docgen/grunt-task'));

    grunt.registerTask('doc', [
        'clean:doc',
        'docgen'
    ]);

    grunt.registerTask('doc:watch', [
        'doc',
        'watch:doc'
    ]);

    grunt.registerTask('serve:doc', [
        'doc',
        'connect:doc',
        'watch:doc'
    ]);

    // ------ Analysis tasks. Runs code analysis -----

    grunt.registerTask('analysis', ['plato']);


    // ------ Deployment tasks -----

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
};

/*---------------------------------------- HELPER METHODS -------------------------------------*/

function mountFolder(connect, dir, options) {
    return connect.static(require('path').resolve(dir), options);
}