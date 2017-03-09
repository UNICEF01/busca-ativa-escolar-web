(function() {

	angular.module('BuscaAtivaEscolar').directive('appCitySelect', function (Cities, StaticData) {


		function init(scope, element, attrs) {
			scope.static = StaticData;

			scope.fetch = fetch;
			scope.renderSelected = renderSelected;
			scope.onUFChanged = onUFChanged;
			scope.onCityChanged = onCityChanged;

			function fetch(query) {
				var data = {name: query, $hide_loading_feedback: true};
				if(scope.uf) data.uf = scope.uf;

				console.log("[components.city_select] Looking for cities: ", data);

				return Cities.search(data).$promise.then(function (res) {
					return res.results;
				});
			}

			function onUFChanged() {
				scope.city = null;
				updateModel(scope.uf, null);
				if(scope.onSelect) scope.onSelect(scope.uf, scope.city);
			}

			function onCityChanged(city) {
				scope.uf = city.uf;
				updateModel(city.uf, city);
				if(scope.onSelect) scope.onSelect(scope.uf, city);
			}

			function updateModel(uf, city) {
				if(!scope.model) return;
				if(scope.ufField) scope.model[scope.ufField] = uf;
				if(scope.cityField) scope.model[scope.cityField] = city;
			}

			function renderSelected(city) {
				if(!city) return '';
				return city.uf + ' / ' + city.name;
			}

		}

		return {
			scope: {
				'onSelect': '=?',
				'isUfRequired': '=?',
				'isCityRequired': '=?',
				'city': '=?',
				'uf': '=?',
				'model': '=?',
				'ufField': '=?',
				'cityField': '=?'
			},
			link: init,
			replace: true,
			templateUrl: '/views/components/city_select.html'
		};
	});

})();