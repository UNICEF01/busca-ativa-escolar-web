(function() {
	angular.module('BuscaAtivaEscolar').service('Decorators', function () {
		var Child = {
			parents: function(child) {
				return (child.mother_name || '')
					+ ((child.mother_name && child.father_name) ? ' | ' : '')
					+ (child.father_name || '');
			}
		};

		var Step = {
		};

		return {
			Child: Child,
			Step: Step
		};
	})
})();