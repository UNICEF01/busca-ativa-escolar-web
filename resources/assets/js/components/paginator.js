(function() {

    angular.module('BuscaAtivaEscolar').directive('appPaginator', function() {


        function init(scope) {

            function validatePageLimits() {
                if (scope.query.page > scope.collection.meta.pagination.total_pages) {
                    scope.query.page = scope.collection.meta.pagination.total_pages
                }

                if (scope.query.page < 1) {
                    scope.query.page = 1
                }
            }

            scope.nextPage = function() {
                if (!scope.query) return;
                if (!scope.collection) return;

                scope.query.page++;

                validatePageLimits();

                scope.onRefresh();
            };

            scope.prevPage = function() {
                if (!scope.query) return;
                if (!scope.collection) return;

                scope.query.page--;

                validatePageLimits();

                scope.onRefresh();
            };

            scope.jumpToPage = function(page) {
                if (!scope.query) return;
                if (!scope.collection) return;

                scope.query.page = page;

                validatePageLimits();

                scope.onRefresh();
            }

        }

        return {
            scope: {
                'onRefresh': '=?',
                'collection': '=?',
                'query': '=?',
            },

            link: init,
            replace: true,

            templateUrl: '/views/components/paginator.html'
        };
    });

})();