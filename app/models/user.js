var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
  tableName: 'users',
  // hasTimestamps: true,

  initialize: function(params){
    var context = this;
    this.set('username', params.username);
    bcrypt.genSalt(10, function(err, salt) {
      if(err) throw err;
      bcrypt.hash(params.password, salt, null, function(err, hash) {
        if(err) throw err;
        context.set('password', hash);
        console.log("Changing/updating password", context.get('password'));
        context.set('salt', salt);
        console.log("Changing/updating salt", context.get('salt'));
        context.trigger('doneCreating');
      });
    });
  },

  authenticate: function(password, callback) {
    console.log("model salt & password in authenticate: ", this.get('salt'), this.get('password'));
    bcrypt.compare(password, this.get('password'), function(err, res) {
        if (err) throw err;
        console.log('Response from authenticate: ', res);
        callback(res);
    });
  }

});

module.exports = User;
