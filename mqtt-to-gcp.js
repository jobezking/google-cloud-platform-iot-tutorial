var fs = require('fs');
var jwt = require('jsonwebtoken');
var mqtt = require('mqtt');
var bme280 = require('bme280');
// Define project info
var projectId = "testprep-323202";
var region = "us-central1";
var registryId = "swa_registry";
var deviceId = "rasp-device";
// MQTT Broker
var mqttHost = "mqtt.googleapis.com";
var mqttPort = 8883;
var alg = "RS256";
// MQTT topic
var mqttTopic = "/devices/rasp-device/events";
// Key
var privateKeyFile = "/home/jobezking/rasp-gcp/certs/rasp_private.pem";
// Let us make clientId
var clientId = "projects/" + projectId + "/locations/" +  region + "/registries/" + registryId + "/devices/" + deviceId;
console.log("Client Id ["+clientId+"]");
const mqttArgs = {
   host: mqttHost,
   port: mqttPort,
   clientId: clientId,
   username: 'unused',
   password: createJwt(projectId, privateKeyFile, alg),
   protocol: 'mqtts',
   secureProtocol: "TLSv1_2_method"
}
// Connecting
var client = mqtt.connect(mqttArgs);
client.on('connect', function(success) {
   
   if (!success) {
      console.log("client not connected...");
   } else {
      console.log("connected");
      /*sendData();*/
      client.publish(mqttTopic, 'nodejs mqtt test', { qos: 0, retain: false }, (error) => {
         if (error) {
           console.error(error)
         }
       })
   }
});
client.on('error', function(err) { 
  console.log('error', err); 
});
client.on('close', function() {
   console.log("Connection closed");
  }
);
client.on('message', function(topic, message, packet) { 
  console.log(topic, 'message received: ', Buffer.from(message, 'base64').toString('ascii')); 
});  
function createJwt(projectId, privateKeyFile, algorithm) { 
  var token = { 
    'iat': parseInt(Date.now() / 1000), 
    'exp': parseInt(Date.now() / 1000) + 3600, 
    'aud': projectId 
  }; 
  var privateKey = fs.readFileSync(privateKeyFile); 
  return jwt.sign(token, privateKey, {algorithm: algorithm}); 
} 
function sendData() {
   bme280.open( {
         i2cAddress: 0x76
      }).then(async sensor => {
      var data = await sensor.read();
      console.log(data);
      var payload = JSON.stringify(data); 
      console.log("Publishing data to MQTT Topic...");
      client.publish(mqttTopic, payload, {qos: 1});
      await sensor.close();      
   }).catch(console.log);
   setTimeout(sendData, 60000);
}
