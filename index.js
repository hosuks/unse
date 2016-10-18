var express = require('express');
var app = express();
var request = require("request");
var cheerio = require("cheerio");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var moment = require("moment");

var Unse = require("./models/Unse");

mongoose.connect(process.env.MONGO_DB); // 1
var db = mongoose.connection;

db.once("open", function(){
  console.log("DB connected");
});
db.on("error", function(err){
  console.log("DB ERROR : ", err);
});

app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//-- 운세 페이지 크롤링
app.get("/", function(req, res){

  var url = "http://www.elle.co.kr/lovenlife/Horoscope.asp?MenuCode=en010405&setDate="+moment().format('YYYY-MM-DD');
  var img = new Array();
  var alt = new Array();
  var description = new Array();
  var termDate;

  request(url, function(error, response, body) {
    if (error) throw error;

    var $ = cheerio.load(body);
    var elements = $("div.listType02 ul li");
    termDate = $("div.listType99 ul li strong");

    elements.each(function(){
       img.push($(this).find("img").attr('src'));
       alt.push($(this).find("span.tit img").attr('alt'));
       description.push($(this).find("span.txt").text());
    });

    res.render("main", {img:img, alt:alt, description:description, termDate:termDate});
  });
});

//-- 수동 푸쉬 발송
app.post("/fcm/send", function(req, res){

  app.use(bodyParser.urlencoded({ extended: false })); // support encoded bodies
  var token = new Array();
  var title = req.body.title;
  var msg = req.body.message;

  if (title == null || title == '') {
    title = '주간 별자리 운세';
  }

  if (msg == null || msg == '') {
    msg = '테스트 메세지 입니다.';
  }

  Unse.find({}, function(err, unse){
    unse.forEach(function(data){
      token.push(data.token);
    });

    var FCM = require('fcm-node');

    var serverKey = 'AIzaSyDp0xta1drbJbd1HhzxsaSTTZ-xakTM4_I';
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

//-- Token 저장하기
app.post("/fcm/register", function(req, res){

  Unse.create(req.body, function(err, contact){
      if(err) {
        return res.json(err);
      }
  });
  console.log("token === " + req.body.token);
});

app.listen(5000, function(){
   console.log('Server On!');
});
