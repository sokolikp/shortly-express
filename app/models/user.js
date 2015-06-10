var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
  tableName: 'users',

  initialize: function() {
    this.on('creating', this.hashPassword);
  },

  hashPassword: function() {
    var crypt = Promise.promisify(bcrypt.hash);
    var context = this;

    return crypt(this.get('password'), null, null)
            .then(function(hash) {
              context.set('password', hash);
            });
  },

  authenticate: function(password, callback) {
    bcrypt.compare(password, this.get('password'), function(err, found) {
        if (err) throw err;
        callback(found);
    });
  }

});

module.exports = User;
