var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var schedule = require("node-schedule");
var Unse = require("./models/Unse");
var FCM = require('fcm-node');

var j = schedule.scheduleJob('1 * * * *', function(){
  mongoose.connect(process.env.MONGO_DB); // 1
  var db = mongoose.connection;

  db.once("open", function(){
    console.log("DB connected");
  });
  db.on("error", function(err){
    console.log("DB ERROR : ", err);
  });

  var token = new Array();

  Unse.find({}, function(err, unse){
    unse.forEach(function(data){
      token.push(data.token);
    });

    var serverKey = 'AIzaSyDp0xta1drbJbd1HhzxsaSTTZ-xakTM4_I';
    var fcm = new FCM(serverKey);

    for(var i = 0; i < token.length; i++) {
      var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
          to: token[i],
          collapse_key: 'your_collapse_key',

          notification: {
              title: '주간 별자리 운세',
              body: '한주간의 운세를 확인하세요.'
          },

          data: {  //you can send only notification or only data(or include both)
              my_key: 'my value',
              my_another_key: 'my another value'
          }
      };

      fcm.send(message, function(err, response){
          if (err) {
              console.log("Something has gone wrong!");
          } else {
              console.log("Successfully sent with response: ", response);
          }
      });
    }
  });
});
