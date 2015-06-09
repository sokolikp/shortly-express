var db = require('../config');
var Link = require('./link.js')

var Click = db.Model.extend({
  tableName: 'clicks',
  hasTimestamps: true,

  // initialize: function(){
  //   this.on('creating', function(model, attrs, options){
  //     var shasum = crypto.createHash('sha1');
  //     shasum.update(model.get('url'));
  //     model.set('code', shasum.digest('hex').slice(0, 5));
  //   });
  // },

  link: function() {
    return this.belongsTo(Link, 'link_id');
  }
});

module.exports = Click;
