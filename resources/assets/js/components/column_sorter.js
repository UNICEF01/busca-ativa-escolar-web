(function() {

	angular.module('BuscaAtivaEscolar').directive('columnSorter', function (Identity, Platform, Auth) {

		function init(scope, element, attrs) {

			var sortModes = [undefined, 'asc', 'desc'];

			scope.sortMode = (scope.model && scope.model[scope.field]) ? scope.model[scope.field] : null;
			scope.sortModeIndex = (scope.sortMode) ? sortModes.indexOf(scope.sortMode) : 0;

			scope.toggleSorting = function() {
				scope.sortModeIndex++;

				if(scope.sortModeIndex >= sortModes.length) {
					scope.sortModeIndex = 0;
				}

				scope.sortMode = sortModes[scope.sortModeIndex];
				scope.model[scope.field] = scope.sortMode;

				if(scope.onChange) {
					scope.onChange(scope.field, scope.sortMode);
				}
			};
			//Default order
            scope.model['created_at'] = 'desc';
		}

		return {
			scope: {
				'model': '=',
				'field': '=',
				'onChange': '=?',
			},
			link: init,
			replace: true,
			transclude: true,
			templateUrl: '/views/components/column_sorter.html'
		};
	});

})();