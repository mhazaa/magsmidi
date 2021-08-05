const https = require('https');
const hostname = 'api.lifx.com';
const accessToken = 'ccb33df1adfc633cdd04f83679b1cc5374d74f698a07e1cd57a62414083cdd95';

class Lifx {
  listLights(id){
    var options = {
      hostname: hostname,
      path: '/v1/lights/all',
      headers: {
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
      }
    }

    https.get(options, function(res){
      var buffer = '';
      res.on('data', function(chunk){
        buffer += chunk;
      });

      res.on('end', function(err){
        var json = JSON.parse(buffer);
        console.log(json);
        //for(var i=0; i<json.contacts.length; i++){
        //  console.log( json.contacts[i] );
        //}
      });
    });
  }

  setLight(settings){
    var that = this;
    var data = JSON.stringify(settings);

    var options = {
      hostname: hostname,
      path: '/v1/lights/all/state',
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
      }
    }

    var req = https.request(options, function(res){
      //console.log(res);
    });
    req.on('error', function(err){
      console.log('error: ' + err.message);
    });
    req.write(data);
    req.end();
  }

  pulseEffect(settings){
    var that = this;
    var data = JSON.stringify(settings);

    var options = {
      hostname: hostname,
      path: '/v1/lights/all/effects/pulse',
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
      }
    }

    var req = https.request(options, function(res){
      console.log(res);
    });
    req.on('error', function(err){
      console.log('error: ' + err.message);
    });
    req.write(data);
    req.end();
  }
}

module.exports = Lifx;
