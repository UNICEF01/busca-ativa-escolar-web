var elixir = require('laravel-elixir');
require('laravel-elixir-sass-compass');
require('laravel-elixir-wiredep');
require('laravel-elixir-bower');

const fs = require('fs');
const path = require('path');
const gulp = require('gulp');

gulp.task('cachebust', function () {
  const filePath = path.join(__dirname, 'public', 'index.html');
  const timestamp = Date.now();

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler o arquivo:', err);
      return;
    }

    // Remover o conteúdo após ?hash= e adiciona o um timestamp em todas as ocorrências de ?hash=
    const newData = data.replace(
      /\?hash=.*?(?=(\s|'|"))/g,
      `?hash=${timestamp}`
    );

    fs.writeFile(filePath, newData, 'utf8', (err) => {
      if (err) {
        console.error('Erro ao escrever no arquivo:', err);
        return;
      }
      console.log('Timestamps adicionados com sucesso!');
    });
  });
});

elixir(function (mix) {
  var defaultCompassSettings = {
    modules: ['sass-css-importer'],
    config_file: 'config.rb',
    style: 'expanded',
    sass: 'resources/assets/sass',
    font: 'public/fonts',
    image: 'public/images',
    javascript: 'public/js',
    sourcemap: true,
  };

  mix.version('public/css/app.css');
  mix.version('public/css/vendor.css');
  mix.compass('vendor.scss', 'public/css', defaultCompassSettings);
  mix.compass('app.scss', 'public/css', defaultCompassSettings);

  var dependencies = require('wiredep')().js;
  var desiredDependencies = [];

  for (var i in dependencies) {
    if (!dependencies.hasOwnProperty(i)) continue;
    if (dependencies[i].indexOf('tinymce-dist') !== -1) continue;

    desiredDependencies.push(dependencies[i]);
  }

  mix.scripts(desiredDependencies, 'public/js/vendor.js', '/');
  mix.scriptsIn('resources/assets/js*', 'public/js/app.js');
  mix.version('app.js');
  mix.browserify('app.js');
});
