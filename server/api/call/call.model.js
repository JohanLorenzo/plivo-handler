'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CallSchema = new Schema({
  '_id': {
    type: String,
    index: {
      unique: true
    }
  },
  digits: String
});

module.exports = mongoose.model('Call', CallSchema);
