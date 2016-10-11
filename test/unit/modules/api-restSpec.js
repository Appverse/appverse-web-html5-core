/*jshint expr:true, node:true */
"use strict";

describe('Unit: Testing appverse.rest module', function() {

    var $httpBackend, scope;

    beforeEach(module('appverse.configuration.default'));
    beforeEach(module('appverse.cache'));
    beforeEach(module('appverse.rest'));

    beforeEach(inject(function($injector, $rootScope) {

        $httpBackend = $injector.get('$httpBackend');

        $injector.get('$http').defaults.cache.removeAll();

        scope = $rootScope.$new();
    }));

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it("GET directive should retrieve a list", inject(function($compile, $rootScope, $timeout) {

        $httpBackend.when('GET', '/api/books.json')
            .respond([{
                id: 1,
                title: 'title1'
            }, {
                id: 2,
                title: 'title2'
            }]);

        $compile('<div av-rest-get="books"></div>')($rootScope);

        expect($rootScope.booksGetting).to.be.true;

        $httpBackend.flush();
        $timeout.flush();

        expect($rootScope.booksGetting).to.be.false;

        expect($rootScope.books.length).to.equal(2);
    }));

    it("GET directive should retrieve an object", inject(function($compile, $rootScope, $timeout) {

        $httpBackend.when('GET', '/api/books/1.json')
            .respond({
                id: 1,
                title: 'title1'
            });

        $compile('<div av-rest-get="books" rest-id="1"></div>')($rootScope);

        expect($rootScope.bookGetting).to.be.true;

        $httpBackend.flush();
        $timeout.flush();

        expect($rootScope.bookGetting).to.be.false;

        expect($rootScope.book).to.be.an.object;
        expect($rootScope.book.id).to.equal(1);
    }));

    it("GET directive should set the correct variable name", inject(function($compile, $rootScope, $timeout) {

        $httpBackend.when('GET', '/api/books.json')
            .respond([{
                id: 1,
                title: 'title1'
            }, {
                id: 2,
                title: 'title2'
            }]);

        $compile('<div av-rest-get="books" rest-name="mybooks"></div>')($rootScope);

        expect($rootScope.mybooksGetting).to.be.true;

        $httpBackend.flush();
        $timeout.flush();

        expect($rootScope.mybooksGetting).to.be.false;

        expect($rootScope.mybooks.length).to.equal(2);
    }));

    it("GET directive should fail with error", inject(function($compile, $rootScope, $timeout) {

        $httpBackend.when('GET', '/api/nobooks.json')
            .respond(404);

        $compile('<div av-rest-get="nobooks"></div>')($rootScope);

        expect($rootScope.nobooksGetting).to.be.true;

        $httpBackend.flush();
        $timeout.flush();

        expect($rootScope.nobooksGetting).to.be.false;
        expect($rootScope.nobooksError).to.be.true;

        expect($rootScope.nobooks).to.be.undefined;
    }));

    it("Remove directive should remove element", inject(function($compile, $timeout, Restangular) {

        $httpBackend.when('DELETE', '/api/books/1.json')
            .respond(200);

        scope.books = [{
            id: 1,
            title: 'title'
        }];
        scope.books = Restangular.restangularizeCollection(null, scope.books, 'books');
        scope.book = scope.books[0];
        scope.book.getParentList = function() {
            return scope.books;
        };

        var element = $compile(angular.element('<button av-rest-remove="book"></button>'))(scope);

        element.triggerHandler('click');

        expect(scope.book.$removing).to.be.true;

        $httpBackend.flush();
        $timeout.flush();

        expect(scope.books).to.have.length(0);
    }));

    it("Remove directive should fail properly", inject(function($compile, $rootScope, $timeout, Restangular) {


        $httpBackend.when('DELETE', '/api/nobooks/1.json')
            .respond(404);

        scope.books = [{
            id: 1,
            title: 'title'
        }];
        scope.books = Restangular.restangularizeCollection(null, scope.books, 'nobooks');
        scope.book = scope.books[0];
        scope.book.getParentList = function() {
            return scope.books;
        };

        var element = $compile(angular.element('<button av-rest-remove="book"></button>'))(scope);

        element.triggerHandler('click');

        expect(scope.book.$removing).to.be.true;

        $httpBackend.flush();
        $timeout.flush();

        expect(scope.book.$removing).to.be.undefined;
        expect(scope.nobooksError).to.be.true;

        expect($rootScope.nobooksErrors).to.have.length(1);
    }));

    it("Save directive should create a new element", inject(function($compile, $rootScope, $timeout, Restangular) {

        $httpBackend.when('POST', '/api/books.json')
            .respond(201);

        scope.books = [{
            id: 1,
            title: 'title'
        }];
        scope.books = Restangular.restangularizeCollection(null, scope.books, 'books');
        scope.book = {
            editing: true,
            getParentList: function() {
                return scope.books;
            }
        };
        scope.books.unshift(scope.book);

        var element = $compile(angular.element('<button av-rest-save="book"></button>'))(scope);

        element.triggerHandler('click');

        expect(scope.books.$saving).to.be.true;

        $httpBackend.flush();
        $timeout.flush();

        expect(scope.books.$saving).to.be.undefined;
    }));

    it("Save directive should update an existing element", inject(function($compile, $rootScope, $timeout, Restangular) {

        $httpBackend.when('PUT', '/api/books/1.json')
            .respond(201);

        scope.books = [{
            id: 1,
            title: 'title'
        }];
        scope.books = Restangular.restangularizeCollection(null, scope.books, 'books');
        scope.book = scope.books[0];
        scope.book.getParentList = function() {
            return scope.books;
        };
        scope.copy = scope.book.clone();
        scope.book.fromServer = true;
        scope.book.editing = true;

        var element = $compile(angular.element('<button av-rest-save="book"></button>'))(scope);

        element.triggerHandler('click');

        expect(scope.book.$saving).to.be.true;

        $httpBackend.flush();
        $timeout.flush();

        expect(scope.books.$saving).to.be.undefined;
    }));

    it("Save directive should fail properly", inject(function($compile, $rootScope, $timeout, Restangular) {

        $httpBackend.when('POST', '/api/nobooks.json')
            .respond(404);

        scope.books = [{
            id: 1,
            title: 'title',
            editing: true
        }];
        scope.books = Restangular.restangularizeCollection(null, scope.books, 'nobooks');
        scope.book = {
            editing: true,
            getParentList: function() {
                return scope.books;
            }
        };
        scope.books.unshift(scope.book);

        var element = $compile(angular.element('<button av-rest-save="book"></button>'))(scope);

        element.triggerHandler('click');

        expect(scope.books.$saving).to.be.true;

        $httpBackend.flush();
        $timeout.flush();

        expect(scope.books.$saving).to.be.undefined;
        expect($rootScope.nobooksErrors.length).to.equal(1);
    }));

    it("Add directive should add an empty element", inject(function($compile, Restangular) {

        scope.books = [{
            id: 1,
            title: 'title'
        }];
        scope.books = Restangular.restangularizeCollection(null, scope.books, 'books');

        var element = $compile(angular.element('<button av-rest-add="books"></button>'))(scope);

        element.triggerHandler('click');

        expect(scope.books.length).to.equal(2);
        expect(scope.books[0].editing).to.be.true;
        expect(scope.books[0].fromServer).not.to.be.true;
        expect(scope.books[0].getParentList()).to.equal(scope.books);
    }));

    it("Clone directive should clone an existing element", inject(function($compile, Restangular) {

        scope.books = [{
            id: 1,
            title: 'title'
        }];
        scope.books = Restangular.restangularizeCollection(null, scope.books, 'books');
        scope.book = scope.books[0];
        scope.book.getParentList = function() {
            return scope.books;
        };

        var element = $compile(angular.element('<button av-rest-clone="book"></button>'))(scope);

        element.triggerHandler('click');

        expect(scope.books.length).to.equal(2);
        expect(scope.books[0].editing).to.be.true;
    }));

    it("Edit directive should edit an existing element", inject(function($compile, Restangular) {

        scope.books = [{
            id: 1,
            title: 'title'
        }];
        scope.books = Restangular.restangularizeCollection(null, scope.books, 'books');
        scope.book = scope.books[0];

        var element = $compile(angular.element('<button av-rest-edit="book"></button>'))(scope);

        element.triggerHandler('click');

        expect(scope.books.length).to.equal(1);
        expect(scope.books[0].editing).to.be.true;
    }));

    it("Cancel directive should edit an existing element", inject(function($compile, Restangular) {

        scope.books = [{
            id: 1,
            title: 'title',
            editing: true
        }];
        scope.books = Restangular.restangularizeCollection(null, scope.books, 'books');
        scope.book = scope.books[0];
        scope.copy = scope.book.clone();
        delete scope.copy.editing;

        var element = $compile(angular.element('<button av-rest-cancel="book"></button>'))(scope);

        element.triggerHandler('click');

        expect(scope.books.length).to.equal(1);
        expect(scope.books[0].editing).to.be.undefined;
    }));
});
