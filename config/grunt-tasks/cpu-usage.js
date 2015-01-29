'use strict';

var os = require('os');

var CpuUsage = module.exports =  function () {
    var
    previousCycles     = 0,
    previousIdleCycles = 0,
    cpus               = [],
    allCpusCycles      = {};

    this.get = function() {
        var totalCycles, totalIdleCycles, cpuUsagePercentage;

        cpus               = getCpusInfo();
        allCpusCycles      = {  user : 0,  nice : 0, idle : 0, irq : 0  };
        Object.keys(cpus)
            .forEach(addCpuTimesToTotal);
        totalCycles        = getTotalCycles();
        totalIdleCycles    = allCpusCycles.idle;
        cpuUsagePercentage = calculateCpuLoadPercentage(totalCycles, totalIdleCycles);
        previousCycles     = totalCycles;
        previousIdleCycles = totalIdleCycles;
        return cpuUsagePercentage;
    };

    function getCpusInfo() {
        return os.cpus();
    }

    function getTotalCycles() {
        return allCpusCycles.user + allCpusCycles.nice + allCpusCycles.idle + allCpusCycles.irq;
    }

    function calculateCpuLoadPercentage(totalCycles, totalIdleCycles) {
        return 1 - (totalIdleCycles - previousIdleCycles ) /
                   (totalCycles - previousCycles);
    }

    function addCpuTimesToTotal(key) {
        var cpu = cpus[key];
        allCpusCycles.user += cpu.times.user;
        allCpusCycles.nice += cpu.times.nice;
        allCpusCycles.idle += cpu.times.idle;
        allCpusCycles.irq += cpu.times.irq;
    }
};
