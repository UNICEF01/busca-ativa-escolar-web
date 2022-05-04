(function() {

    angular.module('BuscaAtivaEscolar').directive('appLoadingFeedback', function(API) {

        function init(scope) {
            scope.isVisible = API.hasOngoingRequests;
        }

        return {
            link: init,
            replace: true,
            templateUrl: '/views/components/loading_feedback.html'
        };
    });

})();