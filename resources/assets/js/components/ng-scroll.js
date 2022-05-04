(function() {

    angular.module('BuscaAtivaEscolar').directive("scroll", function() {
        return function(scope, element) {
            angular.element(element).bind("scroll", function() {
                var divHeight = this.children[0].offsetHeight;
                var divHeightVisibleScroll = this.offsetHeight;
                console.log(divHeight, divHeightVisibleScroll, this.scrollTop)
                if (this.scrollTop >= (divHeight - divHeightVisibleScroll - 50)) {
                    scope.$parent.$parent.term = true;
                } else {
                    scope.$parent.$parent.term = false;
                }
                scope.$apply();
            });
        };
    });
})();