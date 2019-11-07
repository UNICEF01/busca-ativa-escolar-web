(function() {

	angular.module('BuscaAtivaEscolar').directive('recentActivity', function (moment, Platform, Tenants) {

		var log = [];
		var isReady = false;

		function refresh() {
			return Tenants.getRecentActivity({max: 9}, function (data) {
				log = data.data;
				isReady = true;
			});
		}

		function init(scope, element, attrs) {
			scope.getActivity = function() {
				return log;
			};

			scope.isReady = function() {
				return isReady;
			};

			scope.hasRecentActivity = function() {
				return (log && log.length > 0);
			};

			Platform.whenReady(function () {
				refresh();
			});
		}

		return {
			link: init,
			replace: true,
			templateUrl: '/views/components/activity_feed.html'
		};
	});

})();