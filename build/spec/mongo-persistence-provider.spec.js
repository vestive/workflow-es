"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var workflow_es_1 = require("workflow-es");
var mongodb_provider_1 = require("../src/mongodb-provider");
var stringify = require('json-stable-stringify');
describe("mongodb-provider", function () {
    var persistence;
    var wf1;
    var ev1;
    var ev2;
    beforeAll(function (done) {
        var mongoProvider = new mongodb_provider_1.MongoDBPersistence("mongodb://127.0.0.1:27019/tests");
        mongoProvider.connect.then(function () {
            persistence = mongoProvider;
            done();
        });
    });
    describe("createNewWorkflow", function () {
        var returnedId;
        beforeEach(function (done) {
            wf1 = new workflow_es_1.WorkflowInstance();
            return persistence.createNewWorkflow(wf1)
                .then(function (id) {
                returnedId = id;
                done();
            })
                .catch(done.fail);
        });
        it("should return a generated id", function () {
            expect(returnedId).toBeDefined();
        });
        it("should return update original object with id", function () {
            expect(wf1.id).toBeDefined();
        });
    });
    describe("getWorkflowInstance", function () {
        var wf2;
        beforeEach(function (done) {
            persistence.getWorkflowInstance(wf1.id)
                .then(function (wf) {
                wf2 = wf;
                done();
            })
                .catch(done.fail);
        });
        it("should match the orignal", function () {
            expect(stringify(wf2)).toBe(stringify(wf1));
        });
    });
    describe("persistWorkflow", function () {
        var modified;
        beforeEach(function (done) {
            modified = JSON.parse(JSON.stringify(wf1));
            modified.nextExecution = 44;
            modified.executionPointers.push(new workflow_es_1.ExecutionPointer());
            persistence.persistWorkflow(modified)
                .then(function () { return done(); })
                .catch(done.fail);
        });
        it("should match the orignal", function (done) {
            persistence.getWorkflowInstance(modified.id)
                .then(function (data) {
                delete data['_id']; //caveat
                expect(stringify(data)).toBe(stringify(modified));
                done();
            })
                .catch(done.fail);
        });
    });
    describe("createEvent isProcessed:false", function () {
        var returnedId;
        beforeEach(function (done) {
            ev1 = new workflow_es_1.Event();
            ev1.eventName = 'test-event';
            ev1.eventKey = "1";
            ev1.eventData = null;
            ev1.eventTime = new Date();
            ev1.isProcessed = false;
            return persistence.createEvent(ev1)
                .then(function (id) {
                returnedId = id;
                done();
            })
                .catch(done.fail);
        });
        it("should return a generated id", function () {
            expect(returnedId).toBeDefined();
        });
        it("should return update original object with id", function () {
            expect(ev1.id).toBeDefined();
        });
    });
    describe("createEvent isProcessed:true", function () {
        var returnedId;
        beforeEach(function (done) {
            ev2 = new workflow_es_1.Event();
            ev2.eventName = 'test-event';
            ev2.eventKey = "1";
            ev2.eventData = null;
            ev2.eventTime = new Date();
            ev2.isProcessed = true;
            return persistence.createEvent(ev2)
                .then(function (id) {
                returnedId = id;
                done();
            })
                .catch(done.fail);
        });
        it("should return a generated id", function () {
            expect(returnedId).toBeDefined();
        });
        it("should return update original object with id", function () {
            expect(ev2.id).toBeDefined();
        });
    });
    describe("getRunnableEvents", function () {
        var returnedEvents;
        beforeEach(function (done) {
            return persistence.getRunnableEvents()
                .then(function (events) {
                returnedEvents = events;
                done();
            })
                .catch(done.fail);
        });
        it("should contain previous event id", function () {
            expect(returnedEvents).toContain(ev1.id);
        });
    });
    describe("markEventProcessed", function () {
        var eventResult1;
        beforeEach(function (done) {
            return persistence.markEventProcessed(ev1.id)
                .then(function () {
                persistence.getEvent(ev1.id)
                    .then(function (event) {
                    eventResult1 = event;
                    done();
                });
            })
                .catch(done.fail);
        });
        it("should be 'true'", function () {
            expect(eventResult1.isProcessed).toEqual(true);
        });
    });
    describe("markEventUnprocessed", function () {
        var eventResult2;
        beforeEach(function (done) {
            return persistence.markEventUnprocessed(ev2.id)
                .then(function () {
                persistence.getEvent(ev2.id)
                    .then(function (event) {
                    eventResult2 = event;
                    done();
                });
            })
                .catch(done.fail);
        });
        it("should be 'false'", function () {
            expect(eventResult2.isProcessed).toEqual(false);
        });
    });
});
