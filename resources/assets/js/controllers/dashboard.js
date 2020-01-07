(function () {

    angular.module('BuscaAtivaEscolar').controller('DashboardCtrl', function ($scope, moment, Platform, Identity, StaticData, Tenants, Reports, Charts) {

        $scope.identity = Identity;
        $scope.static = StaticData;
        $scope.tenantInfo = Tenants.getSettings();

        $scope.ready = false;
        $scope.showInfo = '';
        $scope.steps = [
            {name: 'Adesão', info: ''},
            {name: 'Configuração', info: ''},
            {name: '1º Alerta', info: ''},
            {name: '1º Caso', info: ''},
            {name: '1ª (Re)matrícula', info: ''}
        ]

        $scope.chartWithContentDownload = function () {
            html2canvas(document.getElementById('regua'), {
                onrendered: function (canvas) {
                    var data = canvas.toDataURL("image/png");
                    var docDefinition = {
                        content: [{
                            image: data,
                            width: 500,
                            logging: true,
                            profile: true,
                            useCORS: true,
                            allowTaint: true
                        }]
                    };
                    pdfMake.createPdf(docDefinition).download("painel_de_metas.pdf");
                }
            });
            // var minhaTabela = document.getElementById('regua').innerHTML;
            // var style = "<style>";
            // style = style + "table {width: 100%;font: 20px Calibri;}";
            // style = style + "table, th, td {border: solid 1px #DDD; border-collapse: collapse;";
            // style = style + "padding: 2px 3px;text-align: center;}";
            // style = style + "</style>";
            // // CRIA UM OBJETO WINDOW
            // var win = window.open('', '', 'height=700,width=700');
            // win.document.write('<html><head>');
            // win.document.write('<title>Empregados</title>');   // <title> CABEÇALHO DO PDF.
            // win.document.write(style);                                     // INCLUI UM ESTILO NA TAB HEAD
            // win.document.write('</head>');
            // win.document.write('<body>');
            // win.document.write(minhaTabela);                          // O CONTEUDO DA TABELA DENTRO DA TAG BODY
            // win.document.write('</body></html>');
            // win.document.close(); 	                                         // FECHA A JANELA
            // win.print();
        }


        Reports.getStatusBar(function (data) {

            var meta = data.goal_box && data.goal_box.goal || 0;
            var atingido = data.goal_box && data.goal_box.reinsertions_classes || 0;
            $scope.percentualAtingido = Math.floor((atingido * 100) / meta);

            if (data.status !== 'ok') {
                $scope.steps[0].info = data.bar && data.bar.registered_at || 0;
                $scope.steps[1].info = data.bar && data.bar.config.updated_at || 0;
                $scope.steps[2].info = data.bar && data.bar.first_alert || 0;
                $scope.steps[3].info = data.bar && data.bar.first_case || 0;
                $scope.steps[4].info = data.bar && data.bar.first_reinsertion_class || 0;
                $scope.otherData = data;

                for (var i = 0; $scope.steps.length >= i; i++) {
                    if ($scope.steps[i]) {
                        var actualDate = moment($scope.steps[i].info || 0);
                        if (actualDate._i !== 0) {
                            $scope.showInfo = i;
                        }
                    }
                }
            }
        });

        function init() {
            $scope.states.length = 0;
            for (var i = 0; i < $scope.stateCount; i++) {
                $scope.states.push({
                    name: 'Step ' + (i + 1).toString(),
                    heading: 'Step ' + (i + 1).toString(),
                    isVisible: true
                });
            }
        };
        $scope.stateCountChange = function () {
            $scope.stateCount = isNaN($scope.stateCount) ? 2 : $scope.stateCount;
            init();
        };

        $scope.setCurrent = function (state) {
            for (var i = 0; i < $scope.states.length; i++) {
                $scope.states[i].isCurrent = false;
            }
            state.isCurrent = true;
        };

        $scope.states = [];
        $scope.stateCount = 2;
        init();

        Platform.whenReady(function () {
            $scope.ready = true;
        });
    });

})();