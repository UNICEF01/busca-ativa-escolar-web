(function() {

	angular.module('BuscaAtivaEscolar').directive('appNavbar', function (Identity, StaticData, Notifications, Platform, Auth) {

		function init(scope, element, attrs) {
			scope.identity = Identity;
			scope.auth = Auth;
			scope.notifications = Notifications;
			scope.platform = Platform;

			scope.showNotifications = true;

			scope.isHidden = function() {
				return !!Platform.getFlag('HIDE_NAVBAR');
			};

			scope.renderTenantName = function() {
				if(Identity.getCurrentUser().tenant) return Identity.getCurrentUser().tenant.name;
				if(Identity.getCurrentUser().uf) return StaticData.getCurrentUF().name;
				return '';
			};

			scope.onMenuToggle = function(isOpen) {
				if(isOpen) Notifications.refresh();
			};

			scope.toggleNotifications = function($event) {
				scope.showNotifications = !scope.showNotifications;

				$event.stopPropagation();
				$event.stopImmediatePropagation();
				$event.preventDefault();

				return false;
			};
		}

		return {
			link: init,
			replace: true,
			templateUrl: '/views/navbar.html'
		};
	});

})();