(function () {

    angular.module('BuscaAtivaEscolar').directive("scroll", function () {
        return function (scope, element, attrs) {
            angular.element(element).bind("scroll", function () {
                var divHeight = this.children[0].offsetHeight;
                var divHeightVisibleScroll = this.offsetHeight;
                if (this.scrollTop >= (divHeight - divHeightVisibleScroll)) {
                    scope.$parent.$parent.term = true;
                } else {
                    scope.$parent.$parent.term = false;
                }
                scope.$apply();
            });
        };
    });
})();