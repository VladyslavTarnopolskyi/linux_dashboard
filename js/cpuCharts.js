var cpuLoadChart;

Highcharts.setOptions({
  global: {
    useUTC: false
  }
});

(function() {
  var cpuChartOptions = {
    chart: {
      type: 'spline',
      width: null,
      height: 250
    },
    credits: { enabled: false },
    title: { text: '' },
    xAxis: {
      type: 'datetime',
      tickPixelInterval: 100
    },
    yAxis: {
      min: 0,
      max: null
    },
    tooltip: {
      xDateFormat: '%A, %b %e, %H:%M:%S'
    }
  };

  $('#cpu-load-chart').highcharts(Highcharts.merge(cpuChartOptions, {
    chart: {
      events: {
        load: function() {
          cpuLoadChart = $('#cpu-load-chart').highcharts();
        }
      }
    },
    yAxis: {
      tickInterval: 0.1,
      title: {
        text: 'CPU Load'
      }
    },
    series: [{
      id: 'one',
      name: '1-Min Avg',
      data: initialData()
    }, {
      id: 'five',
      name: '5-Min Avg',
      data: initialData()
    }, {
      id: 'fteen',
      name: '15-Min Avg',
      data: initialData()
    }]
  }));

})();


// Add dynamic data points to cpuLoad chart
function addToCpuLoadChart(currTime, one, five, fteen) {
  cpuLoadChart.get('one').addPoint([currTime, one], false, true);
  cpuLoadChart.get('five').addPoint([currTime, five], false, true);
  cpuLoadChart.get('fteen').addPoint([currTime, fteen], true, true);
}


function initialData() {
  var data = [],
    time = (new Date()).getTime(),
    i;
  for (i = -19; i <= 0; i++) {
    data.push({
      x: time + (i * 1000),
      y: 0
    });
  }
  return data;
}
