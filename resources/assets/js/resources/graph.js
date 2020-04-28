(function () {
    angular
        .module('BuscaAtivaEscolar')
        .factory('Graph', function Reports(API, Identity, $resource) {
            return $resource(API.getURI('graph/:entity'), {entity: '@entity'}, {
                getReinsertEvolution: {method: 'GET', url: API.getURI('graph/reinsertion_evolution?uf=:uf&tenant_id=:tenant_id')},
            });
        });
})();