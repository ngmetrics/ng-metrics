module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    concat: {
      dist: {
        src: [
            './src/yamd5.js',
            './src/cookie.js',
            './src/digest.js',
            './src/rs.js',
            './src/metrics.js',
            './src/ngmetrics.js'
        ],
        dest: 'dist/ngmetrics.js',
        options: {
          banner: ";(function(global){ \n 'use strict';",
          footer: "}(this));"
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
}
// vim: shiftwidth=2
