/* global AppInit */

// === DEFINE SETTINGS AND BOOTSTRAP THE APPLICATION ===

/*
|--------------------------------------------------------------------------
| Settings
|--------------------------------------------------------------------------
|
| Set configuration here for diferent scenarios:
| - appverseMobile: when Appverse Mobile is detected
| - mobileBrowser
| - environment: application specific settings.
| Settings defined in more than one scenario are overriden by scenario priority.
| As such, 'environment' settings will override any mobile or default values.
|
*/
AppInit.setConfig({

    // Application general environment
    // Overrides defaults and mobile settings
    environment: {

        "PROJECT_DATA" : {
            "VendorLibrariesBaseUrl": '/',
        },
        "LOGGING_CONFIG": {
            "ServerEnabled": false,
            "EnabledLogLevel": true,
            "EnabledErrorLevel": true,
            "EnabledDebugLevel": true,
            "EnabledWarnLevel": true,
            "EnabledInfoLevel": true,
            "LogDateTimeFormat": "%Y-%M-%d %h:%m:%s:%z",
            "LogTextFormat": ""
        },
        "CACHE_CONFIG": {
            "ScopeCache_duration": 10000,
            "ScopeCache_capacity": 10,
            "BrowserStorageCache_Enabled": true,
            "BrowserStorage_type": "2",
            "HttpCache_Enabled": true,
            "HttpCache_duration": 20000,
            "HttpCache_capacity": 10,
            "IndexedDBCache_Enabled": true
        },
        "SERVERPUSH_CONFIG": {
            "BaseUrl": "http://localhost:3000",
            "ListenedPort": "3000",
            "Resource": "socket.io",
            "ConnectTimeout": "10000",
            "TryMultipleTransports": true,
            "Reconnect": true,
            "ReconnectionDelay": 1000,
            "ReconnectionLimit": "Infinity",
            "MaxReconnectionAttempts": 5,
            "SyncDisconnectOnUnload": false,
            "AutoConnect": true,
            "FlashPolicyPort": "",
            "ForceNewConnection": false
        },
        "AD_CONFIG": {
            "ConsumerKey": "",
            "ConsumerSecret": ""
        },
        "I18N_CONFIG": {
            "PreferredLocale": "en-US",
            "DetectLocale": true
        },
        "WEBSOCKETS_CONFIG": {
            "WS_ECHO_URL": "ws://echo.websocket.org",
            "WS_CPU_URL": "ws://localhost:8080/websocket/services/websocket/statistics/get/cpuload",
            "WS_CPU_INTERVAL": 30,
            "WS_CONNECTED": "Connected",
            "WS_DISCONNECTED": "Disconnected",
            "WS_CONNECTING": "Connecting Websocket...",
            "WS_CLOSED": "Websocket connection closed",
            "WS_CLOSING": "Websocket connection closing...",
            "WS_OPEN": "Websocket connection is open",
            "WS_UNKNOWN": "Websocket status is unknown",
            "WS_FAILED_CONNECTION": "Failed to open a Websocket connection",
            "WS_NOT_SUPPORTED": "HTML5 Websockets specification is not supported in this browser.",
            "WS_SUPPORTED": "HTML5 Websockets specification is supported in this browser."
        },
        "REST_CONFIG": {
            "BaseUrl": "api",
            "ExtraFields": [],
            "ParentLess": false,
            "NoCacheHttpMethods": {
                "get": false,
                "post": true,
                "put": false,
                "delete": true,
                "option": false
            },
            "ElementTransformer": [],
            "RequestInterceptor": null,
            "FullRequestInterceptor": null,
            "RestangularFields": {
                "id": "id",
                "route": "route"
            },
            "MethodOverriders": [],
            "DefaultRequestParams": {},
            "FullResponse": false,
            "DefaultHeaders": {},
            "RequestSuffix": ".json",
            "UseCannonicalId": false,
            "EncodeIds": true,
            "MockBackend" : true
        }
    },

    // Settings to use when Appverse Mobile is loaded
    // Will override environment values
    appverseMobile: {
        "LOGGING_CONFIG": {
            "ServerEnabled": false,
            "EnabledLogLevel": true,
            "EnabledErrorLevel": true,
            "EnabledDebugLevel": false,
            "EnabledWarnLevel": true,
            "EnabledInfoLevel": true,
            "LogDateTimeFormat": "%Y-%M-%d %h:%m:%s:%z",
            "LogTextFormat": ""
        },
        "CACHE_CONFIG": {
            "ScopeCache_duration": 10000,
            "ScopeCache_capacity": 10,
            "BrowserStorageCache_Enabled": true,
            "BrowserStorage_type": "2",
            "HttpCache_Enabled": true,
            "HttpCache_duration": 20000,
            "HttpCache_capacity": 10,
            "IndexedDBCache_Enabled": false
        },
        "SERVERPUSH_CONFIG": {
            "BaseUrl": "http://localhost:3000",
            "ListenedPort": "3000",
            "Resource": "socket.io",
            "ConnectTimeout": "10000",
            "TryMultipleTransports": true,
            "Reconnect": true,
            "ReconnectionDelay": 1000,
            "ReconnectionLimit": "Infinity",
            "MaxReconnectionAttempts": 5,
            "SyncDisconnectOnUnload": false,
            "AutoConnect": true,
            "FlashPolicyPort": "",
            "ForceNewConnection": false
        }
    },

    //Settings to use when mobile browser is detected
    // Will override environment values
    mobileBrowser: {
        "LOGGING_CONFIG": {
            "ServerEnabled": false,
            "EnabledLogLevel": true,
            "EnabledErrorLevel": true,
            "EnabledDebugLevel": false,
            "EnabledWarnLevel": true,
            "EnabledInfoLevel": true
        },
        "CACHE_CONFIG": {
            "ScopeCache_duration": 10000,
            "ScopeCache_capacity": 10,
            "BrowserStorageCache_Enabled": true,
            "BrowserStorage_type": "2",
            "HttpCache_Enabled": true,
            "HttpCache_duration": 20000,
            "HttpCache_capacity": 10,
            "IndexedDBCache_Enabled": false
        },
        "SERVERPUSH_CONFIG": {
            "BaseUrl": "http://localhost:3000",
            "ListenedPort": "3000",
            "Resource": "socket.io",
            "ConnectTimeout": "10000",
            "TryMultipleTransports": true,
            "Reconnect": true,
            "ReconnectionDelay": 1000,
            "ReconnectionLimit": "Infinity",
            "MaxReconnectionAttempts": 5,
            "SyncDisconnectOnUnload": false,
            "AutoConnect": true,
            "FlashPolicyPort": "",
            "ForceNewConnection": false
        }
    }
});

/*
|--------------------------------------------------------------------------
| App name
|--------------------------------------------------------------------------
| The name of the main module of the app. If using autobootstrap
| remember to include ng-app="demoApp" in your html
|
*/
AppInit.setMainModuleName('demoApp');


/*
|--------------------------------------------------------------------------
| App Run block
|--------------------------------------------------------------------------
| Perform initializations app services here.
|
| If using mocked backend, define resposes here...
|
*/
AppInit.getMainModule().run(function($httpBackend) {

    //define mocked backend calls here
    $httpBackend.whenGET('api/books.json').respond([
        {
            "id":"01",
            "language": "Javsa",
            "edition": "third",
            "author": "Herbert Schildt"
        },
        {
            "id":"07",
            "language": "C++",
            "edition": "second",
            "author": "E.Balagurusamy"
        }
    ]);

    // do not mock any calls different than api/*
    $httpBackend.whenGET(/^(?!api\/)/).passThrough();

});


/*
|--------------------------------------------------------------------------
| Bootstrap the application
|--------------------------------------------------------------------------
|
| The application is bootstrapped with the given settings.
| Manual bootstrapping is used instead of automatic with the ng-app directive
| to let the developer perform preliminar tasks (e.g. async loading setting files
| from a server).
| If the developer uses automatic bootstrap, this call must be removed
| More info: https://docs.angularjs.org/guide/bootstrap
|
*/
AppInit.bootstrap();








