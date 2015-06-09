var db = require('../config');
var Token = require('../models/token');

var Tokens = new db.Collection();

Tokens.model = Token;

module.exports = Tokens;
