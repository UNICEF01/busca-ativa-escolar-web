(function () {
    identify('config', 'http.js');

    angular.module('BuscaAtivaEscolar').config(function ($httpProvider) {
        $httpProvider.defaults.headers.common = { "Content-Type": "application/json" };

        $httpProvider.interceptors.push('InjectAPIEndpointInterceptor');
        $httpProvider.interceptors.push('TrackPendingRequestsInterceptor');
        $httpProvider.interceptors.push('AddAuthorizationHeadersInterceptor');
        $httpProvider.interceptors.push('HandleExceptionResponsesInterceptor');
        $httpProvider.interceptors.push('HandleErrorResponsesInterceptor');
        //$httpProvider.interceptors.push('InjectTimeEndpointSearch');

    });

})();