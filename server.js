var express = require('express'),
    redis = require('redis');

var app = module.exports = express();

app.use(express.static(__dirname + '/public'));

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
  res.write('Subscribed');
  res.write('\n');

  req.on("close", function(){
    console.log("Disconnected");
    subscriber.unsubscribe();
    subscriber.quit();
  })
});

var server = app.listen(8080, function(){
  console.log("Express server listening on port %d in %s mode", server.address().port, app.settings.env);
});
