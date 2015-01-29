'use strict';

var CpuUsage = module.exports =  function () {
    this.previousCicles = 0;
    this.previousIdleCicles = 0;
};

CpuUsage.prototype.get = function() {
    var self = this;
    var cpus = require('os').cpus();
    var allCpusCicles = {  user : 0,  nice : 0, idle : 0, irq : 0  };
    var cpuKeys = Object.keys(cpus);
    cpuKeys.forEach(function(key) {
      var cpu = cpus[key];
      allCpusCicles.user += cpu.times.user;
      allCpusCicles.nice += cpu.times.nice;
      allCpusCicles.idle += cpu.times.idle;
      allCpusCicles.irq += cpu.times.irq;
    });
    var totalCicles = allCpusCicles.user + allCpusCicles.nice + allCpusCicles.idle + allCpusCicles.irq;
    var totalIdleCicles = allCpusCicles.idle;

    var cpuUsagePercentage = 1 - (totalIdleCicles - self.previousIdleCicles ) /
                                 (totalCicles - self.previousCicles);

    self.previousCicles = totalCicles;
    self.previousIdleCicles = totalIdleCicles;
    return cpuUsagePercentage;
};
