// var port = 8080;

// Module Dependencies

var express = require('express'),
    // routes = require('./routes'),
    redis = require('redis');
    // publisherClient = redis.createClient();


var app = module.exports = express();

app.get('/sync', function(req, res){
  req.socket.setTimeout(0x7FFFFFFF);
  var domain = req.headers.host,
      subDomain = domain.split('.');
  subDomain = subDomain[0]
  console.log('tenant: ' + subDomain);

  var messageCount = 0;
  var subscriber = redis.createClient();

  subscriber.subscribe(subDomain + "_updated");

  subscriber.on("error", function(err){
    console.log("Redis Error: " + err);
  });

  subscriber.on("message", function(channel, message){
    messageCount++;
    res.write('id: ' + messageCount + '\n');
    res.write("data: " + message + '\n\n');
  });

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  res.write('\n');

  req.on("close", function(){
    subscriber.unsubscribe();
    subscriber.quit();
  })
});

var server = app.listen(8080, function(){
  console.log("Express server listening on port %d in %s mode", server.address().port, app.settings.env);
});



// redis.subscribe('tests_updated');
// // var iOS = socketServer.of('/sync')
// socketServer.on('connection', function(socket){
//   redis.on('message', function(channel, message){
//     socket.emit('tests_updated', JSON.parse(message));
//   });
// });
