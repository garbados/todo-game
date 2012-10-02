/**
 * Module dependencies.
 */

// IMPORTS

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , YAML = require('libyaml');

// HELPERS

// gets text from localization files
var localeMiddleware = function (req, res, next) {
  var locale = req.query.lang || "en";
  YAML.readFile("./locales/"+locale+".yml", function(error, documents) {
    if (error) {console.error(error);}
    res.locals.i18n = documents[0];
    next();
  });
};

// CONFIG

var app = express();

app.configure(function(){
  // settings
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  // middleware
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(localeMiddleware);
  app.use(express.cookieParser('stop right there criminal scum'));
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'assets')));
});

app.configure('development', function(){
});

// ROUTES

app.get('/', routes.index);

// START

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
