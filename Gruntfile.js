/* eslint-env node */
module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    concat: {
      dist: {
        src: [
          './src/yamd5.js',
          './src/cookie.js',
          './src/digest.js',
          './src/route.js',
          './src/directive.js',
          './src/rs.js',
          './src/util.js',

          './src/metrics.js',
          './src/ngmetrics.js'
        ],
        dest: 'dist/ngmetrics.js',
        options: {
          banner: ';(function(global){ \n "use strict";',
          footer: '}(this));'
        }
      }
    },

    uglify: {
      options: {
        mangle: {
          except: ['angular']
        }
      },
      dist: {
        files: {
          'dist/ngmetrics.min.js': ['dist/ngmetrics.js']
        }
      }
    },

    watch: {
      src: {
        files: ['src/*.js'],
        tasks: ['concat:dist'],
        options: {
          spawn: false
        }
      }
    }
  });

  grunt.registerTask('default', [
    'concat:dist',
    'watch'
  ]);

  grunt.registerTask('build', [
    'concat:dist',
    'uglify'
  ]);
};

// vim: shiftwidth=2
