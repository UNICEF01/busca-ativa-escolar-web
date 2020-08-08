(function () {

    angular.module('BuscaAtivaEscolar').directive('dhxScheduler', function () {

        return {
            restrict: 'A',
            scope: false,
            transclude: true,
            template: '<div class="dhx_cal_navline" ng-transclude></div><div class="dhx_cal_header"></div><div class="dhx_cal_data"></div>',

            link: function ($scope, $element, $attrs, $controller) {

                //default state of the scheduler
                if (!$scope.scheduler)
                    $scope.scheduler = {};
                $scope.scheduler.mode = $scope.scheduler.mode || "month";
                $scope.scheduler.date = $scope.scheduler.date || new Date();

                //watch data collection, reload on changes
                $scope.$watch($attrs.data, function(collection){
                    scheduler.clearAll();
                    scheduler.parse(collection, "json");
                }, true);

                //watch mode and date
                $scope.$watch(function(){
                    return $scope.scheduler.mode + $scope.scheduler.date.toString();
                }, function(nv, ov) {
                    var mode = scheduler.getState();
                    if (nv.date != mode.date || nv.mode != mode.mode)
                        scheduler.setCurrentView($scope.scheduler.date, $scope.scheduler.mode);
                }, true);

                //adjust size of a scheduler
                $scope.$watch(function () {
                    return $element[0].offsetWidth + "." + $element[0].offsetHeight;
                }, function () {
                    scheduler.setCurrentView();
                });

                //styling for dhtmlx scheduler
                $element.addClass("dhx_cal_container");

                scheduler.config.header = [
                    //"month",
                    "date",
                    "prev",
                    "today",
                    "next"
                ];

                scheduler.locale.labels.section_time = ''; //remove a informaçao do tempo TIME PERIOD do lightbox

                //configurando o popup lightbox
                scheduler.config.lightbox.sections = [
                    { name:"Presentes", height:30, map_to:"text", type:"textarea", focus:true },
                    //{ name:"time", height:2, type:"time", map_to:"auto"} //esconde a selecao de periodo de tempo e data
                ];

                scheduler.templates.lightbox_header = function(start,end,ev){
                    return "Informe o número de presentes"
                };

                //init scheduler
                scheduler.init($element[0], new Date(), "month");

                //removendo a dta do inicio da marcacao do evento
                scheduler.templates.event_bar_date = function(){ return ""; };

                scheduler.templates.event_bar_text = function(start,end,event){
                    return "<span style='font-size: 24px; font-weight: bold;'>"+event.text+"</span>";
                };

            }
        };

    });

})();