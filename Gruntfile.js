var path = require('path');

module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		less: {
			dev: {
				files: {
					'supercal.css': 'less/supercal.less'
				}
			},
			deploy: {
				files: {
					'supercal.min.css': 'less/supercal.less'
				},
				options: {
					optimization: 0,
					compress: true
				}
			}
		},
		watch: {
			less: {
				files: [ 'less/**/*.less' ],
				tasks: [ 'less:dev' ],
				options: {
					interrupt: true
				}
			}
		},
		uglify: {
			deploy: {
				options: {
					banner: '/*! Supercal v0.3.0 compiled on <%= grunt.template.today("dd/mm/yyyy") %> */\n',
					report: true,
					mangle: true,
					preserveComments: false,
					sequences: true,
					properites: true,
					dead_code: true,
					conditionals: true,
					comparisons: true,
					evaluate: true,
					booleans: true,
					loops: true,
					unused: true,
					if_return: true,
					join_vars: true,
					cascade: true,
					warnings: true
				},
				files: {
					'supercal.min.js': 'supercal.js'
				}
			}
		}
	});

	// Load the plugin that provides the 'uglify' task.
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('default', [ 'uglify:deploy', 'less:dev', 'less:deploy' ]);
};