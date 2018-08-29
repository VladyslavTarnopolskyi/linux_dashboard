Highcharts.chart('ram-chart', {
    chart: {
        type: 'pie',
        options3d: {
            enabled: true,
            alpha: 45
        }
    },
    title: {
        text: 'RAM Memory'
    },

    tooltip: {
        valueSuffix: ' %'
    },
    plotOptions: {
        pie: {
            innerSize: 100,
            depth: 75
        }
    },
    series: [{
        name: 'Memory',
        data: [
            ['Used ', 0],
            ['Free ', 0]
        ]
    }]
});
function updateMemGauge(container, total, free, used) {
    var newUsed = (used/total) * 100;
    var memUsedGauge = $(container).highcharts().series[0].points[0];
    memUsedGauge.update(parseFloat(newUsed.toFixed(2)));

    var newFree = (free/total) * 100;
    var memFreeGauge = $(container).highcharts().series[0].points[1];
    memFreeGauge.update(parseFloat(newFree.toFixed(2)));
}
