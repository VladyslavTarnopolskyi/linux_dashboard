$(function() {
    var socket = io.connect('http://localhost:8080/');

    socket.on('onConnection', function(static) {
        console.log(static);
        // PC info
        $('#host').html(static.osInfo.hostname);
        $('#user').html(static.userInfo);

        // OS info
        $('#sys-os').html(static.osInfo.distro + ' ' + static.osInfo.release);
        $('#platform').html(static.osInfo.platform);
        $('#arch').html(static.osInfo.arch);

        // CPU info
        $('#brand').html(static.cpuInfo.brand);
        $('#manufacturer').html(static.cpuInfo.manufacturer);
        $('#speed').html(static.cpuInfo.speed);
        $('#cores').html(static.cpuInfo.cores);
        $('#speedmax').html(static.cpuInfo.speedmax);
    });

    socket.on('heartbeat', function(dynamic) {
        $('#currTime').html(formatCurrTime(dynamic.currTime));
        $('#up-time').html(formatUptime(dynamic.uptime));

        $('#all-proc').html(dynamic.proc.all);
        $('#run-proc').html(dynamic.proc.running);
        $('#blocked-proc').html(dynamic.proc.blocked);
        $('#sleep-proc').html(dynamic.proc.sleeping);

        // CPU Information chart
        var one = dynamic.os[0].toFixed(2);
        var five = dynamic.os[1].toFixed(2);
        var fteen = dynamic.os[2].toFixed(2);
        $('#one').html(one);
        $('#five').html(five);
        $('#fteen').html(fteen);
        addToCpuLoadChart(dynamic.currTime, parseFloat(one),
            parseFloat(five), parseFloat(fteen));

        // RAM / Memory Information
        $('#mem-total').html(filesize(dynamic.mem.total));
        $('#mem-free').html(filesize(dynamic.mem.free));
        $('#mem-used').html(filesize(dynamic.mem.used));
        updateMemGauge('#ram-chart', dynamic.mem.total, dynamic.mem.free, dynamic.mem.used);

        // file info
        var arrDisk = [];
        var arrSize = [];
        var arrFreeSize = [];
        var arrD = [];
        var arrS = [];
        var arrFrS = [];
        // console.log(dynamic.fsSize);

        dynamic.fsSize.forEach(function (item, i) {
            if(item.size == undefined || item.size == null){
                item.size = 0;
                item.used = 0;
            }
            if(item.size >= 0){
                arrSize.push(filesize(item.size) + '<br>');
                arrS.push(numFile(item.size));
                arrFreeSize.push(filesize(item.size - item.used)+ '<br>');
                arrFrS.push(numFile(item.size - item.used));
            }
            arrDisk.push(item.fs + '<br>');
            arrD.push(item.fs);
            $('#disk').html(arrDisk);
            $('#size').html(arrSize);
            $('#free-size').html(arrFreeSize);
        });

        Highcharts.chart('disk-space', {

            chart: {
                type: 'column'
            },

            title: {
                text: 'Used disk space'
            },
            xAxis: {
                categories: arrD,
                title: {
                    text: null
                }
            },
            yAxis: [{
                className: 'highcharts-color-0',
                title: {
                    text: 'Full space, GB'
                }
            }, {
                className: 'highcharts-color-1',
                opposite: true,
                title: {
                    text: 'Used space, GB'
                }
            }],
            tooltip: {
                valueSuffix: ' Gb'
            },
            plotOptions: {
                column: {
                    borderRadius: 5
                }
            },
            series: [{
                name: 'Full',
                data: arrS
            }, {
                name: 'Free',
                data: arrFrS
            }]
        });

    });
});
if (typeof moment === "undefined" && require) {
    moment = require('moment');
}
function numFile(size) {
    var newSize = Math.round(size / Math.pow(1024, 3));
    return newSize;
}
(function(moment) {
    var STRINGS = {
        nodiff: '',
        year: 'year',
        years: 'years',
        month: 'month',
        months: 'months',
        day: 'day',
        days: 'days',
        hour: 'hour',
        hours: 'hours',
        minute: 'minute',
        minutes: 'minutes',
        second: 'second',
        seconds: 'seconds',
        delimiter: ' '
    };

    function pluralize(num, word) {
        return num + ' ' + STRINGS[word + (num === 1 ? '' : 's')];
    }

    function buildStringFromValues(yDiff, mDiff, dDiff, hourDiff, minDiff, secDiff){
        var result = [];

        if (yDiff) {
            result.push(pluralize(yDiff, 'year'));
        }
        if (mDiff) {
            result.push(pluralize(mDiff, 'month'));
        }
        if (dDiff) {
            result.push(pluralize(dDiff, 'day'));
        }
        if (hourDiff) {
            result.push(pluralize(hourDiff, 'hour'));
        }
        if (minDiff) {
            result.push(pluralize(minDiff, 'minute'));
        }
        if (secDiff) {
            result.push(pluralize(secDiff, 'second'));
        }

        return result.join(STRINGS.delimiter);
    }

    moment.fn.preciseDiff = function(d2, returnValueObject) {
        return moment.preciseDiff(this, d2, returnValueObject);
    };

    moment.preciseDiff = function(d1, d2, returnValueObject) {
        var m1 = moment(d1), m2 = moment(d2), firstDateWasLater;

        m1.add(m2.utcOffset() - m1.utcOffset(), 'minutes'); // shift timezone of m1 to m2

        if (m1.isSame(m2)) {
            return STRINGS.nodiff;
        }
        if (m1.isAfter(m2)) {
            var tmp = m1;
            m1 = m2;
            m2 = tmp;
            firstDateWasLater = true;
        } else {
            firstDateWasLater = false;
        }

        var yDiff = m2.year() - m1.year();
        var mDiff = m2.month() - m1.month();
        var dDiff = m2.date() - m1.date();
        var hourDiff = m2.hour() - m1.hour();
        var minDiff = m2.minute() - m1.minute();
        var secDiff = m2.second() - m1.second();

        if (secDiff < 0) {
            secDiff = 60 + secDiff;
            minDiff--;
        }
        if (minDiff < 0) {
            minDiff = 60 + minDiff;
            hourDiff--;
        }
        if (hourDiff < 0) {
            hourDiff = 24 + hourDiff;
            dDiff--;
        }
        if (dDiff < 0) {
            var daysInLastFullMonth = moment(m2.year() + '-' + (m2.month() + 1), "YYYY-MM").subtract(1, 'M').daysInMonth();
            if (daysInLastFullMonth < m1.date()) { // 31/01 -> 2/03
                dDiff = daysInLastFullMonth + dDiff + (m1.date() - daysInLastFullMonth);
            } else {
                dDiff = daysInLastFullMonth + dDiff;
            }
            mDiff--;
        }
        if (mDiff < 0) {
            mDiff = 12 + mDiff;
            yDiff--;
        }

        if (returnValueObject) {
            return {
                "years"   : yDiff,
                "months"  : mDiff,
                "days"    : dDiff,
                "hours"   : hourDiff,
                "minutes" : minDiff,
                "seconds" : secDiff,
                "firstDateWasLater" : firstDateWasLater
            };
        } else {
            return buildStringFromValues(yDiff, mDiff, dDiff, hourDiff, minDiff, secDiff);
        }


    };
}(moment));

function formatUptime(timeSeconds) {
    return moment.preciseDiff(0, timeSeconds*1000);
}

function formatCurrTime(e) {
    var eDate = moment(e);
    var strDate = eDate.format(" HH:mm:ss dddd, DD MMMM, YYYY");
    return strDate;
}
