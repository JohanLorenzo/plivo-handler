'use strict';

var _ = require('lodash');
var Call = require('./call.model');

// Get list of calls
exports.index = function(req, res) {
  Call.find(function (err, calls) {
    if(err) { return handleError(res, err); }
    return res.json(200, calls);
  });
};

// Get a single call
exports.show = function(req, res) {
  Call.findById(req.params.id, function (err, call) {
    if(err) { return handleError(res, err); }
    if(!call) { return res.send(404); }
    return res.json(call);
  });
};

// Creates a new call in the DB.
exports.create = function(req, res) {
  var data = req.body;

  // We handle Plivo specific request
  if ('x-plivo-cloud' in req.headers) {
    data = {
      _id: req.body.CallUUID,
      digits: req.body.Digits
    }
  }

  Call.create(data, function(err, call) {
    if(err) { return handleError(res, err); }
    return res.json(201, call);
  });
};

// Updates an existing call in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Call.findById(req.params.id, function (err, call) {
    if (err) { return handleError(res, err); }
    if(!call) { return res.send(404); }
    var updated = _.merge(call, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, call);
    });
  });
};

// Deletes a call from the DB.
exports.destroy = function(req, res) {
  Call.findById(req.params.id, function (err, call) {
    if(err) { return handleError(res, err); }
    if(!call) { return res.send(404); }
    call.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
