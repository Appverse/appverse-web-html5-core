/*jshint expr:true, node:true */
"use strict";

describe('Unit: Testing appverse.rest module', function () {

    var $httpBackend;

    beforeEach(module('restangular', 'appverse.configuration.default', 'appverse.cache', 'appverse.rest'));

    beforeEach(inject(function ($injector) {
        $httpBackend = $injector.get('$httpBackend');

        $httpBackend.when('GET', '/api/books.json')
            .respond([{
                id: 1,
                title: 'title1'
            }, {
                id: 2,
                title: 'title2'
            }]);

        $httpBackend.when('GET', '/api/books/1.json')
            .respond({
                id: 1,
                title: 'title1'
            });

        $httpBackend.when('GET', '/api/nobooks.json')
            .respond(404);

        $injector.get('$http').defaults.cache.removeAll();
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it("GET directive should retrieve a list", inject(function ($compile, $rootScope) {

        $compile('<div av-rest-get="books"></div>')($rootScope);

        expect($rootScope.booksLoading).to.be.true;

        $httpBackend.flush();

        expect($rootScope.booksLoading).to.be.false;

        expect($rootScope.books.length).to.equal(2);
    }));

    it("GET directive should retrieve an object", inject(function ($compile, $rootScope) {

        $compile('<div av-rest-get="books" rest-id="1"></div>')($rootScope);

        expect($rootScope.bookLoading).to.be.true;

        $httpBackend.flush();

        expect($rootScope.bookLoading).to.be.false;

        expect($rootScope.book).to.be.an.object;
        expect($rootScope.book.id).to.equal(1);
    }));

    it("GET directive should set the correct variable name", inject(function ($compile, $rootScope) {

        $compile('<div av-rest-get="books" rest-name="mybooks"></div>')($rootScope);

        expect($rootScope.mybooksLoading).to.be.true;

        $httpBackend.flush();

        expect($rootScope.mybooksLoading).to.be.false;

        expect($rootScope.mybooks.length).to.equal(2);
    }));

    it("GET directive should fail with error", inject(function ($compile, $rootScope) {

        $compile('<div av-rest-get="nobooks"></div>')($rootScope);

        expect($rootScope.nobooksLoading).to.be.true;

        $httpBackend.flush();

        expect($rootScope.nobooksLoading).to.be.false;
        expect($rootScope.nobooksError).to.be.true;

        expect($rootScope.nobooks).to.be.undefined;
    }));

    it("DELETE directive should remove element", inject(function ($compile, $rootScope) {

        $compile('<div av-rest-get="books" ng-repeat="book in books"><button av-rest-delete="book"></button></div>')($rootScope);

        //        expect($rootScope.bookDeleting).to.be.true;

        //        $httpBackend.flush();

        //        expect($rootScope.bookDeleting).to.be.false;

        //        expect($rootScope.books.length).to.equal(1);
    }));
});