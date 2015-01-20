(function() { 'use strict';


angular.module('demoApp', ['COMMONAPI'])
    .controller('DetectionController', DetectionController)
    .controller('CacheController', CacheController)
    .controller('PerformanceController', PerformanceController)
    .controller('BandwidthController', BandwidthController)
    .controller('RestController', RestController)
    .service('Chart', Chart);


function DetectionController ($scope, Detection) {
    $scope.isMobileText = Detection.isMobileBrowser() ? 'yes' : 'no';
    $scope.hasAppverseMobile = Detection.hasAppverseMobile() ? 'yes' : 'no';
}


function CacheController ($scope, CacheFactory) {
    CacheFactory.getScopeCache().put('famousStone', 'Rosetta');
}


function BandwidthController ($scope, Detection, Chart) {
    $scope.detection = Detection;
    $scope.average = 0;

    // Not playing well with PhantomJS
    // Uncomment lines below to see real-time chart
    /*Chart.init();
    $scope.$watch('detection.bandwidth', function(value) {
        Chart.update(value);
    });*/
}


function Chart() {
    var chart,
    dps        = [], // dataPoints
    dataLength = 10; // number of dataPoints visible at any point

    this.init = function() {
        chart = new CanvasJS.Chart("chartContainer",{
            title :{ text: "Bandwidth (MBytes/s)" },
            data: [{
                type: "splineArea",
                dataPoints: dps
            }]
        });
    };

    this.update = function (value) {
        dps.push({  x: new Date(),  y: value/1024 });
        if (dps.length > dataLength) {
            dps.shift();
        }
        chart.render();
    };
}

function RestController ($scope, RESTFactory) {

    $scope.factoryBooks = RESTFactory.readList('data/books.json');

}


function PerformanceController ($scope, $log, $q, WebWorkerPoolFactory) {
    // some global shared variables
    var targetContext;
    var bulletSize = 20;
    var total = 0;
    var count = 0;
    var starttime = 0;

    var _this = this;

    $scope.execTime = 0;

    //$scope.threadsNumbers = [1,2,4,6,8];
    $scope.threadsNumbers = [
        {
            key: '1',
            value: 'Only one thread'
        },
        {
            key: '2',
            value: 'Two Threads'
        },
        {
            key: '4',
            value: 'Four Threads'
        },
        {
            key: '6',
            value: 'Six Threads'
        },
        {
            key: '8',
            value: 'Eight Threads'
        },
        {
            key: '12',
            value: 'Twelve Threads (gulp!)'
        }
        ];

    $scope.run = function () {
        total = 0;
        count = 0;
        var targetCanvas = document.getElementById("targetCanvas");
        if (targetCanvas) {
            targetCanvas.parentNode.removeChild(targetCanvas);
        }
        $scope.execTime = 0;

        // determine size of image
        var sourceImg = document.getElementById("source");
        var imgwidth = sourceImg.width;
        var imgheight = sourceImg.height;

        // create a canvas and make context available
        var targetCanvas = createTargetCanvas(imgwidth, imgheight);
        targetContext = targetCanvas.getContext("2d");

        // render elements
        starttime = new Date().getTime();

        renderElements(imgwidth, imgheight, sourceImg, $scope.poolSize.key);
    };

    // defines a workpacke object that can be sent to the worker
    function workPackage() {
        this.data = [];
        this.pixelCount = 0;
        this.colors = 0;
        this.x = 0;
        this.y = 0;

        this.result = [0, 0, 0];
    }

    this.callback = function (event) {
        count++;

        if (count == total) {
            var currentTime = new Date().getTime();
            var diff = currentTime - starttime;
            $log.debug("Processing done: " + diff);

            $scope.$apply(function () {
                $scope.execTime = diff;
            });
        }

        var wp = event.data;

        // get the colors
        var colors = wp.result;

        drawRectangle(targetContext, wp.x, wp.y, bulletSize, colors[0]);

    }

    // process the image by splitting it in parts and sending it to the worker
    function renderElements(imgwidth, imgheight, image, poolSize) {
        // determine image grid size
        var nrX = Math.round(imgwidth / bulletSize);
        var nrY = Math.round(imgheight / bulletSize);

        // how much to process
        total = nrX * nrY;

        //var workerTasks = new Array();
        _this.wTask = null;
        _this.poolSize = poolSize;
        _this.workerTasks = [];
        _this.workerData = new WebWorkerPoolFactory.getWorkerFromId('w1', poolSize);


        // iterate through all the parts of the image
        for (var x = 0; x < nrX; x++) {
            for (var y = 0; y < nrX; y++) {
                // create a canvas element we use for temporary rendering
                var canvas2 = document.createElement('canvas');
                canvas2.width = bulletSize;
                canvas2.height = bulletSize;
                var context2 = canvas2.getContext('2d');
                // render part of the image for which we want to determine the dominant color
                context2.drawImage(image, x * bulletSize, y * bulletSize, bulletSize, bulletSize, 0, 0, bulletSize, bulletSize);

                // get the data from the image
                var data = context2.getImageData(0, 0, bulletSize, bulletSize).data;
                // convert data, which is a canvas pixel array, to a normal array
                // since we can't send the canvas array to a webworker
                var dataAsArray = [];
                for (var i = 0; i < data.length; i++) {
                    dataAsArray.push(data[i]);
                }

                // create a workpackage
                var wp = new workPackage();
                wp.colors = 5;
                wp.data = dataAsArray;
                wp.pixelCount = bulletSize * bulletSize;
                wp.x = x;
                wp.y = y;

                //Create a new task for the worker pool and push it into the group
                _this.wTask = new WebWorkerPoolFactory.WorkerTask(_this.workerData, _this.callback, wp);
                _this.workerTasks.push(_this.wTask);

            }
        }

        //Call to the worker pool passing the group of tasks for the worker
        WebWorkerPoolFactory.runParallelTasksGroup(_this.workerData, _this.workerTasks, _this.poolSize);
    }

    // create the target canvas where the result will be rendered
    function createTargetCanvas(imgwidth, imgheight) {
        // create target canvas, with the correct size
        var target = document.getElementById('target');
        var canvas = document.createElement('canvas');
        canvas.setAttribute('id', 'targetCanvas');
        canvas.setAttribute('width', imgwidth);
        canvas.setAttribute('height', imgheight);
        target.appendChild(canvas);

        return canvas;
    }

    // draw a rectangle on the supplied context
    function drawRectangle(targetContext, x, y, bulletSize, colors) {

        targetContext.beginPath();
        targetContext.rect(x * bulletSize, y * bulletSize, bulletSize, bulletSize);
        targetContext.fillStyle = "rgba(" + colors + ",1)";
        targetContext.fill();
    }

    // draw a circle on the supplied context
    function drawCircle(targetContext, x, y, bulletSize, colors) {
        var centerX = x * bulletSize + bulletSize / 2;
        var centerY = y * bulletSize + bulletSize / 2;
        var radius = bulletSize / 2;

        targetContext.beginPath();
        targetContext.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        targetContext.fillStyle = "rgba(" + colors + ",1)";
        targetContext.fill();
    }
}


})();
