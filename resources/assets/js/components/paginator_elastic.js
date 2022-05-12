(function() {

    angular.module('BuscaAtivaEscolar').directive('appPaginatorElastic', function() {

        function init(scope) {

            function validatePageLimits() {
                if (scope.query.from > scope.stats.total_results) {
                    scope.query.from = scope.stats.total_results
                }
                if (scope.query.from < 1) {
                    scope.query.from = 1
                }
            }

            scope.nextPage = function() {
                if (!scope.query) return;
                if (!scope.collection) return;
                scope.query.from++;
                validatePageLimits();
                scope.onRefresh();
            };

            scope.prevPage = function() {
                if (!scope.query) return;
                if (!scope.collection) return;
                scope.query.from--;
                validatePageLimits();
                scope.onRefresh();
            };

            scope.jumpToPage = function(page) {
                if (!scope.query) return;
                if (!scope.collection) return;
                scope.query.from = page;
                validatePageLimits();
                scope.onRefresh();
            };

            scope.fixedNumberOf = function(number) {
                return parseInt(number);
            };

        }

        return {
            scope: {
                'onRefresh': '=?',
                'collection': '=?',
                'query': '=?',
                'stats': '=?',
            },

            link: init,
            replace: true,

            templateUrl: '/views/components/paginator-elastic.html'
        };
    });

})();