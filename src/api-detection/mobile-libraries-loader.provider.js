(function() {
    'use strict';

    angular.module('AppDetection')
        .provider('MobileLibrariesLoader', MobileLibrariesLoaderProvider);

    var defaults = [
        'bower_components/angular-touch/angular-touch.js'
    ];

    /**
     * @ngdoc provider
     * @name AppDetection.provider:MobileLibrariesLoader
     * @description
     * Loads libraries targeted at mobile devices
     */
    function MobileLibrariesLoaderProvider() {

        /**
         * Array of script paths to be loaded
         * @type {[type]}
         */
        this.scripts = defaults;

        this.$get = function() {
            return this;
        };

        /**
         * Loads scripts in parallel and executes them in order
         * using 'async'.
         * Fallsback to 'readyState' for IE<10
         */
        this.load = function() {

            var scripts    = this.scripts,
            pendingScripts = [],
            firstScript    = document.scripts[0],
            src,
            script;

            var scriptsLenght = scripts.length;
            for (var i = 0; i < scriptsLenght; i++) {
                src = scripts[i];
                if ('async' in firstScript) { // modern browsers
                    script = document.createElement('script');
                    script.async = false;
                    script.src = src;
                    document.head.appendChild(script);
                }
                else if (firstScript.readyState) { // IE<10
                    // create a script and add it to our todo pile
                    script = document.createElement('script');
                    pendingScripts.push(script);
                    // listen for state changes
                    script.onreadystatechange = ieStateChange;
                    // must set src AFTER adding onreadystatechange listener
                    // else we’ll miss the loaded event for cached scripts
                    script.src = src;
                }
            }

            // Special case to load scripts in order in IE
            function ieStateChange() {
                // Execute as many scripts in order as we can
                var pendingScript;
                while (pendingScripts[0] && pendingScripts[0].readyState === 'loaded') {
                    pendingScript = pendingScripts.shift();
                    // avoid future loading events from this script (eg, if src changes)
                    pendingScript.onreadystatechange = null;
                    // can't just appendChild, old IE bug if element isn't closed
                    firstScript.parentNode.insertBefore(pendingScript, firstScript);
                }
            }
        };
    }


})();