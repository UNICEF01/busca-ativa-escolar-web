(function () {
    angular
        .module('BuscaAtivaEscolar')
        .factory('Reports', function Reports(API, $resource) {
            var headers = API.REQUIRE_AUTH;
            return $resource(API.getURI('reports/:entity'), { entity: '@entity' }, {
                query: { url: API.getURI('reports/:entity'), method: 'POST', headers: headers },
                getCountryStats: { method: 'GET', url: API.getURI('reports/report'), headers: headers },
                getStateStats: { method: 'GET', url: API.getURI('reports/report'), headers: headers },
                getStatusBar: { method: 'GET', url: API.getURI('reports/city_bar'), headers: headers },
                reportsSelo: { url: API.getURI('reports/selo'), method: 'GET', headers: headers },
                createReportSelo: { url: API.getURI('reports/selo/create'), method: 'POST', headers: headers },
                getDailyRematricula: { method: 'GET', url: API.getURI('reports/data_rematricula_daily'), headers: headers },
                getUfsBySelo: { url: API.getURI('reports/ufs_by_selo'), method: 'GET', headers: headers },
                getTenantsBySelo: { url: API.getURI('reports/tenants_by_selo'), method: 'GET', headers: headers },
                getDataMapFusionChart: { method: 'GET', url: API.getURI('reports/data_map_fusion_chart'), headers: headers },
                reportsChild: { url: API.getURI('reports/child'), method: 'GET', headers: headers },
                createReportChild: { url: API.getURI('reports/child/create'), method: 'POST', headers: headers }
            });
        });
})();