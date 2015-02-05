/* global CanvasJS */
(function () {
    'use strict';


    // Define app components
    // For configuration, see bootstrap.js

    angular.module('demoApp', ['COMMONAPI'])
        .controller('DetectionController', DetectionController)
        .controller('CacheController', CacheController)
        .controller('SimpleIDBController', SimpleIDBController)
        .controller('PerformanceController', PerformanceController)
        .controller('RestController', RestController)
        .controller('I18nController', I18nController)
        .controller('WebSocketsController', WebSocketsController)
        .service('Chart', Chart)
        .filter('dateFormat', DateFormatFilter);


    function DetectionController($scope, Detection, Chart) {
        $scope.isMobileText = Detection.isMobileBrowser() ? 'yes' : 'no';
        $scope.hasAppverseMobile = Detection.hasAppverseMobile() ? 'yes' : 'no';

        $scope.detection = Detection;
        $scope.average = 0;

        // Not playing well with PhantomJS
        // Uncomment lines below to see real-time chart
        /*Chart.init();
        $scope.$watch('detection.bandwidth', function(value) {
            Chart.update(value);
        });*/
    }


    function CacheController($scope, CacheFactory) {
        CacheFactory.getScopeCache().put('famousStone', 'Rosetta');
    }


    function SimpleIDBController($scope, $rootScope, $stateParams, $log, IDBService, CACHE_CONFIG) {

        if ($stateParams.key) {
            IDBService.getDefault(Number($stateParams.key)).then(function (note) {
                $scope.note = note;
                $scope.tagString = "";
                if (note.tags.length) $scope.tagString = note.tags.join(",");
            });
        }


        $scope.clearForm = function () {
            $scope.note.title = "";
            $scope.note.body = "";
            $scope.tagString = "";
            $scope.note.id = ""
        };

        $scope.saveNote = function () {

            var item = new IDBService.item(
                $scope.note.id,
                $scope.note.title,
                $scope.note.body,
                //$scope.note.tags
                $scope.tagString

            );

            IDBService.saveDefault(item).then(function () {
                getNotes();
            });

        };

        function getNotes() {
            IDBService.getDefaults().then(function (res) {
                $scope.notes = res;
            });
        }

        $scope.loadNote = function (key) {
            IDBService.getDefault(key).then(function (note) {
                $scope.note = note;
                $scope.tagString = note.tags;
                $scope.noteSelected = true;
            });
        };

        $scope.deleteNote = function (key) {
            IDBService.deleteDefault(key).then(function () {
                getNotes();
            });
        };

        if (IDBService.isSupported()) {
            getNotes();
        } else {
            $log.error("The HTML5 spec for Indexed DB is not supported in ths browser.");
        }
    }


    function RestController($scope, RESTFactory) {
        $scope.factoryBooks = RESTFactory.readList('books');
    }


    function PerformanceController($scope, $log, $q, WebWorkerPoolFactory) {
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

    function WebSocketsController($scope, $log, WebSocketFactory, Chart, WEBSOCKETS_CONFIG) {

        $scope.showButton = true;
        $scope.wsSupported = Modernizr.websockets;
        $scope.wsIsSupportedMessage = WEBSOCKETS_CONFIG.WS_SUPPORTED;
        $scope.wsIsNotSupportedMessage = WEBSOCKETS_CONFIG.WS_NOT_SUPPORTED;
        $scope.status = 'No connection.';
        $scope.realTimeStats = {};
        $scope.realTimeStats.running = false;

        $scope.realTimeStats.start = function () {
            $scope.realTimeStats.running = true;
            $scope.status = 'Connecting...';

            Chart
                .inElementWithId('chartContainer')
                .setTitle('CPU load')
                .setOptions({
                    visiblePoints: 200,
                    latencyMilliseconds: 100
                })
                .init();

            WebSocketFactory.subscribe(updateChartWhenNewDataArrives);
            WebSocketFactory.connect(WEBSOCKETS_CONFIG.WS_CPU_URL);
            initWebSocketFactoryEvents();
        };

        $scope.realTimeStats.stop = function () {
            $scope.realTimeStats.running = false;
            Chart.clearPoints();
            WebSocketFactory.disconnect();
            $scope.status = 'Disconnecting...';
        };

        function updateChartWhenNewDataArrives(message) {
            if (message != WEBSOCKETS_CONFIG.WS_CONNECTED) {

                /* Workaround for deployed demo */
                if (message.charAt(0) === '{') {
                    message = JSON.parse(message).data.pop().value;
                }

                Chart.update(message);
            }
        }

        function initWebSocketFactoryEvents() {
            WebSocketFactory.ws.onopen = function (event) {
                $log.debug(event);
                WebSocketFactory.ws.send('');
                $scope.status = 'Connection opened!';
                $scope.$digest();
            };

            WebSocketFactory.ws.onclose = function (event) {
                $log.debug(event);
                $scope.status = 'Connection closed.';
                WebSocketFactory.ws = null;
                $scope.$digest();
            };
        }
    }


    function I18nController($scope, $translate, tmhDynamicLocale) {
        $scope.now = new Date();
        $scope.name = 'Alex';
        $scope.age = '14';

        $scope.setLocale = function (locale) {
            $translate.uses(locale);
            tmhDynamicLocale.set(locale.toLowerCase());
        };
    }


    function Chart() {
        var chart,
            dps = [], // dataPoints
            title = "",
            elementId = null,
            options = {
                // number of dataPoints visible at any point
                visiblePoints: 200
            };

        this.inElementWithId = function (id) {
            elementId = id;
            return this;
        };

        this.setTitle = function (text) {
            title = text;
            return this;
        };

        this.setOptions = function (newOptions) {
            Object.keys(newOptions).forEach(function (optionName) {
                options[optionName] = newOptions[optionName];
            });
            return this;
        };

        this.init = function () {
            this.initEmptyData();
            chart = new CanvasJS.Chart(elementId, {
                backgroundColor: "#212121",
                title: {
                    text: title
                },
                axisY: {
                    minimum: 0,
                    maximum: 100
                },
                data: [{
                    type: "column",
                    color: "green",
                    dataPoints: dps,
            }]
            });
            this.update(0);
            return this;
        };

        this.initEmptyData = function () {
            for (var i = 0; i < options.visiblePoints; i++) {
                var date = new Date();
                var previousTime = date.setTime(date.getTime() - ((options.visiblePoints - i) * options.latencyMilliseconds));
                this.addPointAsXandYcoordinates(previousTime, 0);
            }
        };

        this.update = function (value) {
            this.addPointAsXandYcoordinates(new Date(), value);
            if (dps.length > options.visiblePoints) {
                dps.shift();
            }
            chart.render();
        };

        this.clearPoints = function () {
            dps = [];
        };

        this.addPointAsXandYcoordinates = function (x, y) {
            dps.push({
                x: x,
                y: Number(y)
            });
        };
    }

    function DateFormatFilter() {
        return function (input) {
            if (!input)
                return "";
            input = new Date(input);
            var res = (input.getMonth() + 1) + "/" + input.getDate() + "/" + input.getFullYear() + " ";
            var hour = input.getHours();
            var ampm = "AM";
            if (hour === 12)
                ampm = "PM";
            if (hour > 12) {
                hour -= 12;
                ampm = "PM";
            }
            var minute = input.getMinutes() + 1;
            if (minute < 10)
                minute = "0" + minute;
            res += hour + ":" + minute + " " + ampm;
            return res;
        };
    }


})();