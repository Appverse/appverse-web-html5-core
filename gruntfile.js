'use strict';

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
        autoprefixer: {
            options: ['last 1 version'],
            tmp: {
                files: [{
                    expand: true,
                    cwd: '.tmp/styles/',
                    src: '**/*.css',
                    dest: '.tmp/styles/'
                }]
            },
            styles: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/styles/',
                    src: '**/*.css',
                    dest: '.tmp/styles/'
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
            server: '.tmp',
	    docular: 'doc',
	    coverage: '<%= yeoman.test %>/coverage'
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                '<%= yeoman.app %>/{,*/}*.js'
            ]
        },
        coffee: {
            options: {
                sourceMap: true,
                sourceRoot: ''
            },
            app: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/scripts',
                    src: '**/*.coffee',
                    dest: '.tmp/scripts',
                    ext: '.js'
                }]
            },
            test: {
                files: [{
                    expand: true,
                    cwd: 'test/spec',
                    src: '{,*/}*.coffee',
                    dest: '.tmp/spec',
                    ext: '.js'
                }]
            }
        },
        compass: {
            options: {
                sassDir: '<%= yeoman.app %>/styles',
                cssDir: '.tmp/styles',
                generatedImagesDir: '.tmp/images/generated',
                imagesDir: '<%= yeoman.app %>/images',
                javascriptsDir: '<%= yeoman.app %>/scripts',
                fontsDir: '<%= yeoman.app %>/styles/fonts',
                importPath: '<%= yeoman.app %>/bower_components',
                httpImagesPath: '/images',
                httpGeneratedImagesPath: '/images/generated',
                httpFontsPath: '/styles/fonts',
                relativeAssets: false
            },
            dist: {
                options: {
                    debugInfo: false
                }
            },
            server: {
                options: {
                    debugInfo: true
                }
            }
        },
        concat: {
            options: {
              separator: ';',
            },
            dist: {
              src: [
                        '<%= yeoman.app %>/bower_components/angular-cache/dist/angular-cache.js',
                        '<%= yeoman.app %>/modules/api-cache.js',
                        '<%= yeoman.app %>/modules/api-configuration.js',
                        '<%= yeoman.app %>/modules/api-detection.js',
                        '<%= yeoman.app %>/modules/api-logging.js',
                        '<%= yeoman.app %>/modules/api-main.js',
                        '<%= yeoman.app %>/bower_components/lodash/dist/lodash.underscore.js',
                        '<%= yeoman.app %>/bower_components/restangular/dist/restangular.js',
                        '<%= yeoman.app %>/modules/api-rest.js',
                        '<%= yeoman.app %>/bower_components/socket.io-client/dist/socket.io.js',    
                        '<%= yeoman.app %>/modules/api-serverpush.js',
                        '<%= yeoman.app %>/modules/api-translate.js',
                        '<%= yeoman.app %>/bower_components/angular-translate/angular-translate.js',
                        '<%= yeoman.app %>/bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
                        '<%= yeoman.app %>/bower_components/angular-dynamic-locale/src/tmhDynamicLocale.js',
                        '<%= yeoman.app %>/modules/api-utils.js',
                        '<%= yeoman.app %>/directives/cache-directives.js',
                        '<%= yeoman.app %>/directives/rest-directives.js',
                        '<%= yeoman.app %>/modules/api-performance.js'
                   ],
              dest: '<%= yeoman.dist %>/appverse-html5-core.js',
            },
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - */'
            },
            dist: {
	    	files: {
                   
                    '<%= yeoman.dist %>/angular-jqm.min.js':['<%= yeoman.app %>/angular-jqm.js'],
					'<%= yeoman.dist %>/modules/api-cache.min.js':['<%= yeoman.app %>/modules/api-cache.js'],
					'<%= yeoman.dist %>/modules/api-configuration.min.js':['<%= yeoman.app %>/modules/api-configuration.js'],
					'<%= yeoman.dist %>/modules/api-detection.min.js':['<%= yeoman.app %>/modules/api-detection.js'],
					'<%= yeoman.dist %>/modules/api-logging.min.js':['<%= yeoman.app %>/modules/api-logging.js'],
					'<%= yeoman.dist %>/modules/api-main.min.js':['<%= yeoman.app %>/modules/api-main.js'],
					'<%= yeoman.dist %>/modules/api-performance.min.js':['<%= yeoman.app %>/modules/api-performance.js'],
					'<%= yeoman.dist %>/modules/api-rest.min.js':['<%= yeoman.app %>/modules/api-rest.js'],
					'<%= yeoman.dist %>/modules/api-serverpush.min.js':['<%= yeoman.app %>/modules/api-serverpush.js'],
					'<%= yeoman.dist %>/modules/api-translate.min.js':['<%= yeoman.app %>/modules/api-translate.js'],
					'<%= yeoman.dist %>/modules/api-utils.min.js':['<%= yeoman.app %>/modules/api-utils.js'],
					'<%= yeoman.dist %>/directives/cache-directives.min.js':['<%= yeoman.app %>/directives/cache-directives.js'],
					'<%= yeoman.dist %>/directives/rest-directives.min.js':['<%= yeoman.app %>/directives/rest-directives.js'],
					'<%= yeoman.dist %>/directives/webworker-directives.min.js':['<%= yeoman.app %>/directives/webworker-directives.js'],
                    '<%= yeoman.dist %>/appverse-html5-core.min.js':['<%= yeoman.dist %>/appverse-html5-core.js']
                   
                }
            }
        },       
        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    removeCommentsFromCDATA: true,
                    removeCDATASectionsFromCDATA: true,
                    collapseWhitespace: true,
                    //                    conservativeCollapse: true,
                    collapseBooleanAttributes: true,
                    removeAttributeQuotes: false,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true,
                    keepClosingSlash: true,
                },
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.dist %>',
                    src: [
                        '*.html',
                        'views/**/*.html',
                        'template/**/*.html'
                    ],
                    dest: '<%= yeoman.dist %>'
                }]
            }
        },
        // Put files not handled in other tasks here
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.dist %>',
                    src: [
                        '*.{ico,png,txt}',
                        '.htaccess',
                        'api/**',
                        'images/{,*/}*.{gif,webp}',
                        'resources/**',
                        'styles/fonts/*',
                        'styles/images/*',
                        '*.html',
                        'views/**/*.html',
                        'template/**/*.html'
                    ]
                }, {
                    expand: true,
                    cwd: '.tmp/images',
                    dest: '<%= yeoman.dist %>/images',
                    src: [
                        'generated/*'
                    ]
                }, {
                    expand: true,
                    cwd: '<%= yeoman.app %>/bower_components/angular-i18n',
                    dest: '<%= yeoman.dist %>/resources/i18n/angular',
                    src: [
                        '*en-us.js',
                        '*es-es.js',
                        '*ja-jp.js',
                        '*ar-eg.js'
                    ]
                }]
            },
            styles: {
                expand: true,
                cwd: '<%= yeoman.app %>/styles',
                dest: '.tmp/styles',
                src: '**/*.css'
            },
            i18n: {
                expand: true,
                cwd: '<%= yeoman.app %>/bower_components/angular-i18n',
                dest: '.tmp/resources/i18n/angular',
                src: [
                    '*en-us.js',
                    '*es-es.js',
                    '*ja-jp.js',
                    '*ar-eg.js'
                ]
            },
            png: {
                expand: true,
                cwd: '<%= yeoman.app %>',
                dest: '<%= yeoman.dist %>',
                src: 'images/**/*.png'
            }
        },
        karma: {
            unit: {
                configFile: '<%= yeoman.test %>/karma.conf.js',
                singleRun: true,
            },
            unitWatch: {
                configFile: '<%= yeoman.test %>/karma.conf.js',
                autoWatch: true
            },
        },
        cdnify: {
            dist: {
                html: ['<%= yeoman.dist %>/*.html']
            }
        },
        ngAnnotate: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/concat/scripts',
                    src: '*.js',
                    dest: '.tmp/concat/scripts'
                }]
            }
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
		// Unit tests.
		nodeunit: {
			tests: ['test/**/*_test.js']
		}
    });

    // -- Load plugins --

	grunt.loadNpmTasks('grunt-docular');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-mocha');
    	grunt.loadNpmTasks('grunt-karma');
    	grunt.loadNpmTasks('grunt-bump');
    	grunt.loadNpmTasks('grunt-maven-deploy');
    	grunt.loadNpmTasks('grunt-contrib-concat');


    grunt.registerTask('test', [
        'clean:server',
        'concurrent:server',
        'autoprefixer',
        'connect:test',
        'karma'
    ]);

    // -- Register tasks --

    grunt.registerTask('doc', [
		'clean:docular',
        'docular'
    ]);

	grunt.registerTask('test',[
		//'jshint',
		'clean:coverage',
		'karma:unit'
	]);

    // Test on change
    grunt.registerTask('test:watch', [
		'karma:unitWatch'
	]);

    grunt.registerTask('dist', [
        'clean:dist',
        'autoprefixer',
        'copy:dist',
        'cdnify',
        'ngAnnotate',
	'concat:dist',
        'uglify',
        'htmlmin'
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

    grunt.registerTask('default', [
        'dist'
    ]);

};