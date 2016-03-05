module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    },

    jshint: {
      files: [
        'server/**/*.js',
        'public/client/**/*.js'
      ],
      options: {
        jshintrc: '_.jshintrc',
        ignores: [
          'public/client/assets/libs/**/*.js',
          'public/client/assets/js/**/*.js'
        ],
        force: true
      }
    },

    sass: {
      options: {
        sourceMap: true
      },
      dist: {
        files: {
          'public/client/assets/css/main.css': 'public/client/assets/css/main.scss'
        }
      }
    },

    watch: {
      scripts: {
        files: [
          'server/**/*.js',
          'public/client/**/*'
        ],
        tasks: [
          'build', 
          'test'
        ]
      },
      sass: {
        files: [
          'public/client/assets/css/**/*.scss'
        ],
        tasks: [
          'sass'
        ]
      },
      dev: {
        files: [
          'public/client/**/*.js',
          'public/client/**/*.html',
          'public/client/**/*.scss',
          '!public/client/dist/**/*',
          '!.min.css',
          '!.min.js'
        ],
        tasks: [
          'build'
        ]
      }
    },

    cssmin: {
      options: {
        sourceMap: true,
        target: 'public/client/dist'
      },
      dist: {
        files: [
          {
            expand: true,
            cwd: 'public/client/assets/css/',
            src: ['*.css', '!.min.css'],
            dest: 'public/client/dist',
            ext: '.min.css'
          }
        ]
      }
    },

    concat: {
      options: {
        separator: ';'
      },
      app: {
        src: [
          'public/client/app/**/*.js'
        ],
        dest: 'public/client/dist/app.js'
      }
    },

    uglify: {
      scripts: {
        files: {
          'public/client/dist/app.min.js': ['public/client/dist/app.js']
        },
        options: {
          sourceMap: "true"
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-sass');

  grunt.registerTask('sassy', ['sass']);

  grunt.registerTask('build', ['cssmin', 'concat', 'uglify']);
  grunt.registerTask('test', ['mochaTest']);

  grunt.registerTask('default', ['watch']);

  grunt.registerTask('heroku:production', [
    'build'
  ]);


};
