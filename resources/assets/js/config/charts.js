(function () {
  identify('config', 'charts.js');
  angular.module('BuscaAtivaEscolar').run(function (Config) {
    Highcharts.setOptions({
      lang: {
        months: [
          'Janeiro',
          'Fevereiro',
          'Março',
          'Abril',
          'Maio',
          'Junho',
          'Julho',
          'Agosto',
          'Setembro',
          'Outubro',
          'Novembro',
          'Dezembro',
        ],
        shortMonths: [
          'Jan',
          'Fev',
          'Mar',
          'Abr',
          'Mai',
          'Jun',
          'Jul',
          'Ago',
          'Set',
          'Out',
          'Nov',
          'Dez',
        ],
        weekdays: [
          'Domingo',
          'Segunda',
          'Terça',
          'Quarta',
          'Quinta',
          'Sexta',
          'Sábado',
        ],
        loading: ['Atualizando o gráfico...'],
        contextButtonTitle: 'Exportar gráfico',
        decimalPoint: ',',
        thousandsSep: '.',
        downloadJPEG: 'Baixar imagem JPEG',
        downloadPDF: 'Baixar arquivo PDF',
        downloadPNG: 'Baixar imagem PNG',
        downloadSVG: 'Baixar vetor SVG',
        printChart: 'Imprimir gráfico',
        rangeSelectorFrom: 'De',
        rangeSelectorTo: 'Para',
        rangeSelectorZoom: 'Zoom',
        resetZoom: 'Voltar zoom',
        resetZoomTitle: 'Voltar zoom para nível 1:1'
      }
    });
  });
})();
