(function() {
    'use strict';

    angular.module('demoApp')
        .service('BackendMock', BackendMock);


    /**
     * Defines responses from a mocked backend
     */
    function BackendMock($httpBackend) {
        this.$httpBackend = $httpBackend;
    }


    BackendMock.prototype.defineResponses = function() {
        var $httpBackend = this.$httpBackend;

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
    };


})();