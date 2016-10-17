var express = require("express");
var app = express();
var request = require("request");
var cheerio = require("cheerio");
var moment = require("moment");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var Lucky = require("./models/Lucky");

var url = "http://www.unsin.co.kr/unse/free/todayline/result";

var oneLineArr = new Array();
var yearsArr = new Array();
var descriptionArr = new Array();

mongoose.connect(process.env.MONGO_DB); // 1
var db = mongoose.connection;

db.once("open", function(){
  console.log("DB connected");
});
db.on("error", function(err){
  console.log("DB ERROR : ", err);
});

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

request(url, function(error, response, body) {
  if (error) throw error;

  var $ = cheerio.load(body);
  var oneLine = $("div.title dd");          // 한줄 요약
  var years = $("div.year tbody th");       // 년도
  var description = $("div.year tbody td"); // 운세 내용

  // 띠별 한줄 운세 요약
  oneLine.each(function(){
      oneLineArr.push($(this).text());
  });

  // 년도
  years.each(function(){
      yearsArr.push($(this).text());
  });

  // 운세 내용
  description.each(function(){
      descriptionArr.push($(this).text());
  });
});

app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));

app.get("/", function(req, res){
    res.render("lucky", {oneLineTxt:oneLineArr, yearsTxt:yearsArr, descriptionTxt:descriptionArr, moment:moment});
});

//-- Token 저장하기
app.post("/fcm/register", function(req, res){
  //console.log(req.body.token);
  Lucky.create(req.body, function(err, lucky){
       if(err) {
         return res.json(err);
       }
  });
  console.log("token === " + req.body.token);
});

//-- 수동 푸쉬 발송
app.post("/fcm/send", function(req, res){

  app.use(bodyParser.urlencoded({ extended: false })); // support encoded bodies
  var token = new Array();
  var title = req.body.title;
  var msg = req.body.message;

  console.log('title === ' + title);
  console.log('msg === ' + msg);

  if (title == null || title == '') {
    title = '오늘의 띠별 운세';
  }

  if (msg == null || msg == '') {
    msg = '오늘은 어떤 운세가 기다리고 있을까요?';
  }

  Lucky.find({}, function(err, lucky){
    lucky.forEach(function(data){
      token.push(data.token);
    });

    var FCM = require('fcm-node');

    var serverKey = 'AIzaSyA4nFElRbVC_p41I2UHfHAtb8FxZWoeZU4';
    var fcm = new FCM(serverKey);

    for(var i = 0; i < token.length; i++) {
      console.log(token[i]);
      var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
          to: token[i],
          collapse_key: 'your_collapse_key',

          notification: {
              title: title,
              body: msg
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

app.listen(5001, function(){
   console.log('5001 port Server On!');
});
