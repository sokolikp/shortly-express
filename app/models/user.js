var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
  tableName: 'users',
  // hasTimestamps: true,

  // initialize: function(params){
  //   var context = this;
  //   this.set('username', params.username);
  //   bcrypt.genSalt(10, function(err, salt) {
  //     if(err) throw err;
  //     bcrypt.hash(params.password, salt, null, function(err, hash) {
  //       if(err) throw err;
  //       context.set('password', hash);
  //       console.log("Changing/updating password", context.get('password'));
  //       context.set('salt', salt);
  //       console.log("Changing/updating salt", context.get('salt'));
  //       context.trigger('doneCreating');
  //     });
  //   });
  // },

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
    console.log("model password in authenticate: ", this.get('password'));
    bcrypt.compare(password, this.get('password'), function(err, found) {
        if (err) throw err;
        console.log('Response from authenticate: ', found);
        callback(found);
    });
  }

});

module.exports = User;
