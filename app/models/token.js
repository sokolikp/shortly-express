var db = require('../config');
var Promise = require('bluebird');

var User = db.Model.extend({
  tableName: 'tokens',
  // hasTimestamps: true,

});

module.exports = User;
