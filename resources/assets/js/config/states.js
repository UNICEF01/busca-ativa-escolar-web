(function() {
	identify('config', 'states.js');

	angular.module('BuscaAtivaEscolar')
		.config(function($stateProvider, $locationProvider, $urlRouterProvider) {

			$locationProvider.html5Mode({
				enabled: false,
				requireBase: true}
				);
			$urlRouterProvider.otherwise('/dashboard');

			$stateProvider
				.state('login', {
					url: '/login',
					templateUrl: '/views/login.html',
					controller: 'LoginCtrl',
					unauthenticated: true
				})
				.state('dashboard', {
					url: '/dashboard',
					templateUrl: '/views/dashboard.html',
					controller: 'DashboardCtrl'
				})
				.state('developer_mode', {
					url: '/developer_mode',
					templateUrl: '/views/developer/developer_dashboard.html',
					controller: 'DeveloperCtrl',
					unauthenticated: true

				})
				.state('settings', {
					url: '/settings?step',
					templateUrl: '/views/settings/manage_settings.html',
					controller: 'SettingsCtrl'
				})
				.state('settings.parameterize_group', {
					url: '/parameterize_group/{group_id}',
					templateUrl: '/views/settings/parameterize_group.html',
					controller: 'ParameterizeGroupCtrl'
				})
				.state('credits', {
					url: '/credits',
					templateUrl: '/views/static/credits.html',
					controller: 'CreditsCtrl',
					unauthenticated: true
				})
				.state('tenant_signup', {
					url: '/tenant_signup',
					templateUrl: '/views/tenant_signup/main.html',
					controller: 'TenantSignupCtrl',
					unauthenticated: true
				})
				.state('state_signup', {
					url: '/state_signup',
					templateUrl: '/views/state_signup/main.html',
					controller: 'StateSignupCtrl',
					unauthenticated: true
				})

		});

})();
