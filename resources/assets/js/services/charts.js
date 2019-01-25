(function() {
//Cria o icone de download
    Highcharts.SVGRenderer.prototype.symbols.download = function (x, y, w, h) {
        var path = [
            // Arrow stem
            'M', x + w * 0.5, y,
            'L', x + w * 0.5, y + h * 0.7,
            // Arrow head
            'M', x + w * 0.3, y + h * 0.5,
            'L', x + w * 0.5, y + h * 0.7,
            'L', x + w * 0.7, y + h * 0.5,
            // Box
            'M', x, y + h * 0.9,
            'L', x, y + h,
            'L', x + w, y + h,
            'L', x + w, y + h * 0.9
        ];
        return path;
    };

	var app = angular.module('BuscaAtivaEscolar');

	app.service('Charts', function Charts(Utils) {

		function generateDimensionChart(report, seriesName, labels, chartType, yAxisLabel, valueSuffix) {

			console.log("[charts] Generating dimension chart: ", seriesName, report);

			if(!report || !seriesName || !labels) return;
			if(!chartType) chartType = 'bar';
			if(!yAxisLabel) yAxisLabel = 'Quantidade';
			if(!valueSuffix) valueSuffix = 'casos';

			var data = [];
			var categories = [];

			for(var i in report) {
				if(!report.hasOwnProperty(i)) continue;

				var category = (labels[i]) ? labels[i] : i;

				data.push({
					name: category,
					y: report[i]
				});

				categories.push( category );

			}

			return {
				options: {
					chart: {
						type: chartType
					},
					title: {
						text: ''
					},
					subtitle: {
						text: ''
					}
				},
				xAxis: {
					id: Utils.generateRandomID(),
					categories: categories,
					title: {
						text: null
					}
				},
				yAxis: {
					id: Utils.generateRandomID(),
					min: 0,
					title: {
						text: yAxisLabel,
						align: 'high'
					},
					labels: {
						overflow: 'justify'
					}
				},
				tooltip: {
					valueSuffix: ' ' + valueSuffix
				},
				plotOptions: {
					bar: {
						dataLabels: {
							enabled: true
						}
					},
					pie: {
						allowPointSelect: true,
						showInLegend: true,
						cursor: 'pointer',
						dataLabels: {
							enabled: true
						}
					}
				},
				legend: {
					layout: 'vertical',
					align: 'right',
					verticalAlign: 'top',
					x: -40,
					y: 80,
					floating: true,
					borderWidth: 1,
					backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
					shadow: true,
                    useHTML: true,
                    labelFormatter: function() {
                        return '<div style="text-align: left; width:130px;float:left;">' + this.name + '</div><div style="width:40px; float:left;text-align:right;">' + this.y + '%</div>';
                    }
				},
				credits: {
					enabled: false
				},
				series: [
					{
						id: Utils.generateRandomID(),
						colorByPoint: true,
						name: seriesName,
						data: data
					}
				]
			};
		}

		function generateTimelineChart(report, chartName, labels) {

			console.log("[charts] Generating timeline chart: ", chartName, report);

			if(!report || !chartName || !labels) return;

			var series = [];
			var categories = [];
			var data = {};
			var dates = Object.keys(report);

            var colors = [];
            colors['out_of_school'] = '#f44336';
            colors['in_school'] = '#4885f4';
            colors['cancelled'] = '#f49117';
            colors['in_observation'] = '#f4ec2b';
            colors['completed'] = '#1df40a';

            // Translates ￿date -> metric to metric -> date; prepares list of categories
			for(var date in report) {

				if(!report.hasOwnProperty(date)) continue;

				if(categories.indexOf(date) === -1) {
					categories.push(Utils.convertISOtoBRDate(date));
				}

				for(var metric in report[date]) {
					if(!report[date].hasOwnProperty(metric)) continue;
					if(!data[metric]) data[metric] = {};

					data[metric][date] = report[date][metric];

				}
			}

			// Builds series array
			for(var m in data) {
				if(!data.hasOwnProperty(m)) continue;

				var metricData = [];

				// Ensure even metrics with incomplete data (missing dates) show up accurately
				for(var i in dates) {
					if(!dates.hasOwnProperty(i)) continue;
					metricData.push( (data[m][dates[i]]) ? data[m][dates[i]] : null );
				}

				series.push({
					name: labels[m] ? labels[m] : m,
					data: metricData,
					color: labels[m] ? colors[m] : ''
				});
			}


			return {
				options: {
					chart: {
						type: 'line'
					},

					xAxis: {
						categories: categories,
						allowDecimals: false
					},

					yAxis: {
						title: {text: chartName}
					}
				},
				series: series,
				title: {
					text: ''
				},
				loading: false,
                credits: {
                    enabled: false
                }
			};
		}

		return {
			generateDimensionChart: generateDimensionChart,
			generateTimelineChart: generateTimelineChart
		};

	});

})();