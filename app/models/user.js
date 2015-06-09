var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
  tableName: 'users',
  // hasTimestamps: true,

  initialize: function(params){
    var context = this;
    var newUser = {};
    newUser['username'] = params.username;
    this.on('creating', bcrypt.genSalt(10, function(err, salt) {
      if(err) throw err;
      bcrypt.hash(params.password, salt, null, function(err, hash) {
        console.log(hash);
        if(err) throw err;
        newUser['password'] = hash;
        newUser['salt'] = salt;
        console.log(newUser);
        // context.set('password', hash);
        // context.set('salt', salt);
        context.save(newUser).then(function() {
          console.log('Saved new user');
        });
      });
    }));
  },

  authenticate: function(password, callback) {
    return bcrypt.compare(password, this.get('password'), function(err, res) {
        if (err) throw err;
        // console.log('Response from authenticate: ', res);
        // return res;
        callback(res);
    });
  }

});

module.exports = User;
