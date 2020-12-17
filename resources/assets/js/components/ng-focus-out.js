(function() {

	angular.module('BuscaAtivaEscolar').directive('ngFocusOut', function( $timeout ) {
        return function( $scope, elem, attrs ) {
            $scope.$watch(attrs.ngFocusOut, function( newval ) {
                if ( newval ) {
                    $timeout(function() {
                        elem[0].focusout();
                    }, 0, false);
                }
            });
        };
    });

})();