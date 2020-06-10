(function() {
	identify('core', 'app.js');

	angular
		.module('BuscaAtivaEscolar', [
			'ngToast',
			'ngAnimate',
			'ngCookies',
			'ngResource',
			'ngStorage',
			'ngFileUpload',

			'BuscaAtivaEscolar.Config',

			'angularMoment',
			'highcharts-ng',
			'checklist-model',

			'idf.br-filters',
			'jsonFormatter',
			'uiGmapgoogle-maps',

			'ui.router',
			'ui.bootstrap',
			'ui.select',
			'ui.utils.masks',
			'ui.ace',
			'datatables',
            'ui.mask',
            'angular.viacep',
			'ngclipboard',
			'ng-fusioncharts',
			'heremaps',
		])
})();
