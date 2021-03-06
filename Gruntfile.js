module.exports = function(grunt) {
  var banner = '/*!\n' +
               ' * deselect.js v<%= pkg.version %> (<%= pkg.homepage %>)\n' +
               ' * Licensed under the <%= pkg.license %> ' +
                              '(<%= pkg.homepage %>/blob/master/LICENSE)\n' +
               ' */\n';
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      all: ['Gruntfile.js', 'src/**/*.js', 'spec/**/*.js'],
      options: {
        'eqeqeq': true,
        'forin': true,
        'unused': true
      }
    },
    jasmine_nodejs: {
      test: {
        specs: 'spec/pure.spec.js'
      }
    },
    browserify: {
      build: {
        src: 'src/*.js',
        dest: 'dist/<%= pkg.name %>.js'
      },
      options: {
        banner: banner
      }
    },
    uglify: {
      options: {
        banner: banner
      },
      build: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['dist/<%= pkg.name %>.js'],
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jasmine-nodejs');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-browserify');

  grunt.registerTask('test', ['jshint', 'jasmine_nodejs']);
  grunt.registerTask('build', ['browserify', 'uglify']);
  grunt.registerTask('default', ['test', 'build']);
};

