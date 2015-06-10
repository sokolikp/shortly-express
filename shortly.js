//PORT: 4568
var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var session = require('express-session');
var bodyParser = require('body-parser');


var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');
var Tokens = require('./app/collections/tokens');
var Token = require('./app/models/token');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(session({
  secret: 'captain planet',
  resave: false,
  saveUninitialized: true
}));


app.get('/',
function(req, res) {
  //logic that probits this site unless valid user
  console.log('Rendering index file');
  res.render('index');
  //res.renderAllLinks();
});

app.get('/signup',
function(req, res) {
  res.render('signup');
});

app.get('/login',
function(req, res) {
  // Tokens.query({where: {token_id: req.sessionID}}).fetch().then(function(data) {
  //     res.redirect('/');
  // }).catch(function(err) {
  //   res.render('login');
  // });
  res.render('login');
});

app.get('/create',
function(req, res) {
  //logic that probits this site unless valid user
  res.render('index');
});

app.get('/logout',
function(req, res) {
  // console.log('Logging out; SessionID: ', req.sessionID);
  // Tokens.query({where: {token_id: req.sessionID}}).fetch().then(function(data) {
  //   var tokenRef = data.at(0);
  //   console.log('destroying data');
  //   tokenRef.destroy();
  //   req.session.destroy(function(err) {});
  //   res.redirect('/login');
  // }).catch(function(err) {
  //   console.log('I did not find a session - fATAL ERROR!');
  // });
  console.log('logging out user as a get method');
});

app.post('/logout',
function(req, res) {
  console.log('logging out user as a post method');
});

app.get('/links',
  //logic that probits this access always
function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.send(200, links.models);
  });
});

app.post('/links',
function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var link = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin
        });

        link.save().then(function(newLink) {
          Links.add(newLink);
          res.send(200, newLink);
        });
      });
    }
  });
});

app.post('/signup', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

 new User({username: username}).fetch().then(function(userModel) {
    if(userModel) { //user exists
      return console.log("User already exists!");
    } else {
      var user = new User({username: username, password: password});
      user.save().then(function(savedUser) {
        console.log('User saved to database');
        res.redirect('/');
      });
    }
  });
});

app.post('/login', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  var user = new User({username: username}).fetch().then(function(userModel) {
    if(userModel) { //user exists
      userModel.authenticate(password, function(found) {
        if (found) res.redirect('/');
        else {
          console.log('Incorrect password. Redirecting');
          res.redirect('/login');
        }
      });
    } else {
      console.log('This user does not exist. Redirecting to signup.');
      res.redirect('/signup');
    }
  });
});

/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        link_id: link.get('id')
      });

      click.save().then(function() {
        console.log(click);
        db.knex('urls')
          .where('code', '=', link.get('code'))
          .update({
            visits: link.get('visits') + 1,
          }).then(function() {
            return res.redirect(link.get('url'));
          });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);
