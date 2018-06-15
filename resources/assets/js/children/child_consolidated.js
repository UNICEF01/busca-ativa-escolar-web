(function() {

	angular.module('BuscaAtivaEscolar')
		.controller('ChildConsolidatedCtrl', ChildConsolidatedCtrl)

		.config(function ($stateProvider) {
			$stateProvider
				.state('child_viewer.consolidated', {
					url: '/consolidated',
					templateUrl: '/views/children/view/consolidated.html',
					controller: 'ChildConsolidatedCtrl'
				})
		});

	function ChildConsolidatedCtrl($scope, $state, $stateParams, Children, Decorators, Utils) {
		$scope.Decorators = Decorators;
		$scope.Children = Children;

		$scope.refreshChildData = function(callback) {
			return $scope.child = Children.find({id: $scope.child_id, with: 'currentStep,consolidated'}, callback);
		};

		$scope.fields = {};
		$scope.child_id = $stateParams.child_id;
		$scope.child = $scope.refreshChildData(function (data) {
			var consolidated = Utils.unpackDateFields(data.consolidated, dateOnlyFields)
			angular.copy(consolidated, $scope.fields);
		});

		var dateOnlyFields = ['enrolled_at', 'report_date', 'dob', 'guardian_dob', 'reinsertion_date'];

		$scope.getConsolidatedFields = function() {
			return $scope.fields;
		};

		$scope.isCheckboxChecked = function(field, value) {
			if(!$scope.fields) return false;
			if(!$scope.fields[field]) $scope.fields[field] = [];
			return $scope.fields[field].indexOf(value) !== -1;
		};


		console.log("[core] @ChildConsolidatedCtrl", $scope.child);

	}

})();