(function() {

	angular.module('BuscaAtivaEscolar').directive('lastMonthTimeline', function ($timeout, moment, Platform, Reports, Charts) {

		function init(scope, element, attrs) {

			var timelineData = {};
			var timelineChart = {};
			var timelineReady = false;

			var isReady = false;
			var hasEnoughData = false;

			scope.getTimelineConfig = getTimelineConfig;

			scope.isReady = function() {
				return isReady;
			};

			scope.hasEnoughData = function() {
				return hasEnoughData;
			};

            scope.firstDate = null;
            scope.finalDate = null;

            //----------------------------
            scope.popupStart = {
                opened: false
            };

            scope.popupFinish = {
                opened: false
            };

			scope.formatDates = 'ddMMyyyy';

            scope.dateOptionsStart = {
                formatYear: 'yyyy',
                showWeeks: false
            };

            scope.dateOptionsFinish = {
                formatYear: 'yyyy',
                maxDate: new Date(),
                showWeeks: false
            };

			scope.openStartDate = function () {
                scope.popupStart.opened = true;
            };

            scope.openFinishDate = function () {
                scope.popupFinish.opened = true;
            };
            //----------------------------

			scope.fetchTimelineData= function() {

				var startDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
				var endDate = moment().format('YYYY-MM-DD');

                if( scope.firstDate != null ) startDate = moment(scope.firstDate).format('YYYY-MM-DD');
                if( scope.finalDate != null ) endDate = moment(scope.finalDate).format('YYYY-MM-DD');

				return Reports.query({
					view: 'time_series',
					entity: 'children',
					dimension: 'child_status',
					filters: {
						date: {from: startDate, to: endDate},
						case_status: ['in_progress', 'completed', 'interrupted', 'cancelled', 'transferred'],
						alert_status: ['accepted']
					}
				}, function (data) {
					timelineData = data;
					timelineChart = getTimelineChart();
					timelineReady = true;

					isReady = true;
					hasEnoughData = (
						timelineData &&
						timelineData.response &&
						timelineData.response.report.length &&
						timelineData.response.report.length > 0
					);

					$timeout(function() {
						scope.$broadcast('highchartsng.reflow');
					}, 1000);
				});
			}

			function getTimelineChart() {
				var report = timelineData.response.report;
				var chartName = 'Evolução do status dos casos';
				var labels = timelineData.labels ? timelineData.labels : {};

				return Charts.generateTimelineChart(report, chartName, labels);

			}

			function getTimelineConfig() {
				if(!timelineReady) return;
				return timelineChart;
			}

			Platform.whenReady(function () {
				scope.fetchTimelineData();
			});
		}

		return {
			link: init,
			replace: true,
			templateUrl: '/views/components/last_month_timeline.html'
		};
	});

})();