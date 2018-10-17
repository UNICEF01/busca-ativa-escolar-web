var elixir = require('laravel-elixir');
require('laravel-elixir-sass-compass');
require('laravel-elixir-wiredep');
require('laravel-elixir-bower');

elixir(function(mix) {

	var defaultCompassSettings = {
		modules: ['sass-css-importer'],
		config_file: "config.rb",
		style: "expanded",
		sass: "resources/assets/sass",
		font: "public/fonts",
		image: "public/images",
		javascript: "public/js",
		sourcemap: true
	};

	mix.compass('vendor.scss', 'public/css', defaultCompassSettings);
	mix.compass('app.scss', 'public/css', defaultCompassSettings);

	var dependencies = require('wiredep')().js;
	var desiredDependencies = [];

	for(var i in dependencies) {
		if(!dependencies.hasOwnProperty(i)) continue;
		if(dependencies[i].indexOf('tinymce-dist') !== -1) continue;

		desiredDependencies.push(dependencies[i]);
	}

	mix.scripts(desiredDependencies, "public/js/vendor.js", "/");
	mix.scriptsIn('resources/assets/js*', 'public/js/app.js');
	mix.browserify('app.js');

});
