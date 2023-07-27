(function() {
    angular
        .module('BuscaAtivaEscolar')
        .factory('Report', function Reports(API_PUBLIC, $resource) {
            return $resource(API_PUBLIC.getURI('report/:entity'), { entity: '@entity' }, {
                getStatusCity: { method: 'GET', url: API_PUBLIC.getURI('report/city?city=:city&uf=:uf') },
                getStatusCityByCountry: { method: 'GET', url: API_PUBLIC.getURI('report/city?ibge_id=:ibge_id&uf=:uf') }
            });
        });
})();