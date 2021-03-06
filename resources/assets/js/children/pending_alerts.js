(function() {

	angular.module('BuscaAtivaEscolar')
		.config(function ($stateProvider) {
			$stateProvider.state('pending_alerts', {
				url: '/pending_alerts',
				templateUrl: '/views/children/pending_alerts.html',
				controller: 'PendingAlertsCtrlCtrl'
			})
		})
		.controller('PendingAlertsCtrlCtrl', function ($scope, $rootScope, Platform, Identity, Alerts, StaticData) {

			$scope.identity = Identity;
			$scope.sendingAlert = false;
			$scope.children = {};
			$scope.child = {};
			$scope.causes = {};

			$scope.query = {
                name: null,
				submitter_name: null,
                sort: {},
                max: 16,
				page: 1,
				neighborhood: null,
				show_suspended: false
            };

            $scope.search = {};
			
			$scope.getAlertCauseName = function(id) {
				if(!$scope.child) return 'err:no_child_open';
				if(!$scope.child.alert) return 'err:no_alert_data';
				if(!$scope.child.alert.alert_cause_id) return 'err:no_alert_cause_id';
				var indexAlertCauses = _.findIndex($scope.causes, {id: $scope.child.alert.alert_cause_id});
				if(!$scope.causes[indexAlertCauses]) return 'err:no_cause_with_id';
				return $scope.causes[indexAlertCauses].label;
			};

            $scope.setMaxResults = function(max) {
                $scope.query.max = max;
                $scope.query.page = 1;
                $scope.refresh();
            };

			$scope.static = StaticData;
			
			$scope.refresh = function() {
				$scope.child = null;
				$scope.children = Alerts.getPending($scope.query);
				$scope.search = $scope.children;
			};

			$scope.preview = function(child) {
				$scope.child = child
				$('#modalChild').modal({
					keyboard: false,
				});
			};

			$scope.canAcceptAlert = function(child) {
				if(!child) return false;
				if(!child.requires_address_update) return true;
				return child.alert
					&& child.alert.place_address
					&& (child.alert.place_address.trim().length > 0)
					&& child.alert.place_neighborhood
					&& (child.alert.place_neighborhood.trim().length > 0);
			};

			$scope.accept = function(child) {
				if(!$scope.canAcceptAlert(child)) {
					return;
				}

				$scope.sendingAlert = true;

				Alerts.accept({id: child.id, place_address: child.alert.place_address, place_neighborhood: child.alert.place_neighborhood}, function() {
					$scope.refresh();
					$scope. child = {};
					$('#modalChild').modal('hide');
					$scope.sendingAlert = false;
				});
			};

			$scope.reject = function(child) {
				Alerts.reject({id: child.id}, function() {
					$scope.refresh();
					$scope.child = {};
					$('#modalChild').modal('hide');
				});
			};

			Platform.whenReady(function() {
				$scope.causes = StaticData.getAlertCauses();
				$scope.refresh();
			});

		});

})();