"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var workflow_es_1 = require("workflow-es");
var mongodb_1 = require("mongodb");
var MongoDBPersistence = /** @class */ (function () {
    function MongoDBPersistence(connectionString) {
        this.retryCount = 0;
        var self = this;
        this.connect = new Promise(function (resolve, reject) {
            var options = { useNewUrlParser: true, useUnifiedTopology: true };
            mongodb_1.MongoClient.connect(connectionString, options, function (err, client) {
                if (err)
                    reject(err);
                self.client = client;
                var db = self.client.db();
                self.workflowCollection = db.collection("workflows");
                self.subscriptionCollection = db.collection("subscriptions");
                self.eventCollection = db.collection("events");
                resolve();
            });
        });
    }
    MongoDBPersistence.prototype.disconnect = function () {
        return this.client.close();
    };
    MongoDBPersistence.prototype.createNewWorkflow = function (instance) {
        return __awaiter(this, void 0, void 0, function () {
            var self, deferred;
            return __generator(this, function (_a) {
                self = this;
                deferred = new Promise(function (resolve, reject) {
                    self.workflowCollection.insertOne(instance)
                        .then(function (err, result) {
                        instance.id = instance["_id"].toString();
                        resolve(instance.id);
                    })
                        .catch(function (err) { return reject(err); });
                });
                return [2 /*return*/, deferred];
            });
        });
    };
    MongoDBPersistence.prototype.persistWorkflow = function (instance) {
        var self = this;
        var deferred = new Promise(function (resolve, reject) {
            var id = mongodb_1.ObjectID(instance.id);
            delete instance['_id'];
            self.workflowCollection.findOneAndUpdate({ _id: id }, { $set: instance }, { returnOriginal: false }, function (err, r) {
                if (err)
                    reject(err);
                resolve();
            });
        });
        return deferred;
    };
    MongoDBPersistence.prototype.getWorkflowInstance = function (workflowId) {
        var self = this;
        var deferred = new Promise(function (resolve, reject) {
            self.workflowCollection.findOne({ _id: mongodb_1.ObjectID(workflowId) }, (function (err, doc) {
                if (err)
                    reject(err);
                doc.id = doc._id.toString();
                resolve(doc);
            }));
        });
        return deferred;
    };
    MongoDBPersistence.prototype.getRunnableInstances = function () {
        var self = this;
        var deferred = new Promise(function (resolve, reject) {
            self.workflowCollection.find({ status: workflow_es_1.WorkflowStatus.Runnable, nextExecution: { $lt: Date.now() } }, { _id: 1 })
                .toArray(function (err, data) {
                if (err)
                    reject(err);
                var result = [];
                for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                    var item = data_1[_i];
                    result.push(item["_id"].toString());
                }
                resolve(result);
            });
        });
        return deferred;
    };
    MongoDBPersistence.prototype.createEventSubscription = function (subscription) {
        var self = this;
        var deferred = new Promise(function (resolve, reject) {
            self.subscriptionCollection.insertOne(subscription)
                .then(function (err, result) {
                subscription.id = subscription["_id"].toString();
                resolve();
            })
                .catch(function (err) { return reject(err); });
        });
        return deferred;
    };
    MongoDBPersistence.prototype.getSubscriptions = function (eventName, eventKey, asOf) {
        return __awaiter(this, void 0, void 0, function () {
            var self, deferred;
            return __generator(this, function (_a) {
                self = this;
                deferred = new Promise(function (resolve, reject) {
                    self.subscriptionCollection.find({ eventName: eventName, eventKey: eventKey, subscribeAsOf: { $lt: asOf } })
                        .toArray(function (err, data) {
                        if (err)
                            reject(err);
                        for (var _i = 0, data_2 = data; _i < data_2.length; _i++) {
                            var item = data_2[_i];
                            item.id = item["_id"].toString();
                        }
                        resolve(data);
                    });
                });
                return [2 /*return*/, deferred];
            });
        });
    };
    MongoDBPersistence.prototype.terminateSubscription = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var self, deferred;
            return __generator(this, function (_a) {
                self = this;
                deferred = new Promise(function (resolve, reject) {
                    self.subscriptionCollection.remove({ _id: mongodb_1.ObjectID(id) }, { single: true }, function (err, numberOfRemovedDocs) {
                        if (err)
                            reject(err);
                        resolve();
                    });
                });
                return [2 /*return*/, deferred];
            });
        });
    };
    MongoDBPersistence.prototype.createEvent = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var self, deferred;
            return __generator(this, function (_a) {
                self = this;
                deferred = new Promise(function (resolve, reject) {
                    self.eventCollection.insertOne(event)
                        .then(function (err, result) {
                        event.id = event["_id"].toString();
                        resolve(event.id);
                    })
                        .catch(function (err) { return reject(err); });
                });
                return [2 /*return*/, deferred];
            });
        });
    };
    MongoDBPersistence.prototype.getEvent = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var self, deferred;
            return __generator(this, function (_a) {
                self = this;
                deferred = new Promise(function (resolve, reject) {
                    self.eventCollection.findOne({ _id: mongodb_1.ObjectID(id) }, (function (err, doc) {
                        if (err)
                            reject(err);
                        doc.id = doc._id.toString();
                        resolve(doc);
                    }));
                });
                return [2 /*return*/, deferred];
            });
        });
    };
    MongoDBPersistence.prototype.getRunnableEvents = function () {
        return __awaiter(this, void 0, void 0, function () {
            var self, deferred;
            return __generator(this, function (_a) {
                self = this;
                deferred = new Promise(function (resolve, reject) {
                    self.eventCollection.find({ isProcessed: false, eventTime: { $lt: new Date() } }, { _id: 1 })
                        .toArray(function (err, data) {
                        if (err)
                            reject(err);
                        var result = [];
                        for (var _i = 0, data_3 = data; _i < data_3.length; _i++) {
                            var item = data_3[_i];
                            result.push(item["_id"].toString());
                        }
                        resolve(result);
                    });
                });
                return [2 /*return*/, deferred];
            });
        });
    };
    MongoDBPersistence.prototype.markEventProcessed = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var self, deferred;
            return __generator(this, function (_a) {
                self = this;
                deferred = new Promise(function (resolve, reject) {
                    self.eventCollection.findOneAndUpdate({ _id: mongodb_1.ObjectID(id) }, { $set: { isProcessed: true } }, { returnOriginal: true }, function (err, r) {
                        if (err)
                            reject(err);
                        resolve();
                    });
                });
                return [2 /*return*/, deferred];
            });
        });
    };
    MongoDBPersistence.prototype.markEventUnprocessed = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var self, deferred;
            return __generator(this, function (_a) {
                self = this;
                deferred = new Promise(function (resolve, reject) {
                    self.eventCollection.findOneAndUpdate({ _id: mongodb_1.ObjectID(id) }, { $set: { isProcessed: false } }, { returnOriginal: true }, function (err, r) {
                        if (err)
                            reject(err);
                        resolve();
                    });
                });
                return [2 /*return*/, deferred];
            });
        });
    };
    MongoDBPersistence.prototype.getEvents = function (eventName, eventKey, asOf) {
        return __awaiter(this, void 0, void 0, function () {
            var self, deferred;
            return __generator(this, function (_a) {
                self = this;
                deferred = new Promise(function (resolve, reject) {
                    self.eventCollection.find({ eventName: eventName, eventKey: eventKey, eventTime: { $gt: asOf } }, { _id: 1 })
                        .toArray(function (err, data) {
                        if (err)
                            reject(err);
                        var result = [];
                        for (var _i = 0, data_4 = data; _i < data_4.length; _i++) {
                            var item = data_4[_i];
                            result.push(item["_id"].toString());
                        }
                        resolve(result);
                    });
                });
                return [2 /*return*/, deferred];
            });
        });
    };
    return MongoDBPersistence;
}());
exports.MongoDBPersistence = MongoDBPersistence;
