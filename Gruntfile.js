module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jasmine_nodejs: {
      test: {
        specs: 'spec/pure.spec.js'
      }
    },
    browserify: {
      build: {
        src: 'src/*.js',
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '/*!\n * deselect.js v<%= pkg.version %> (<%= pkg.homepage %>)\n * Licensed under the <%= pkg.license %> (<%= pkg.homepage %>/blob/master/LICENSE)\n */\n'
      },
      build: {
        src: 'dist/<%= pkg.name %>.js',
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-jasmine-nodejs');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-browserify');

  grunt.registerTask('test', ['jasmine_nodejs']);
  grunt.registerTask('default', ['test', 'browserify', 'uglify']);
};

