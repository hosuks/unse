var express = require("express");
var app = express();
var request = require("request");
var cheerio = require("cheerio");
var moment = require("moment");

var url = "http://www.unsin.co.kr/unse/free/todayline/result";

var oneLineArr = new Array();
var yearsArr = new Array();
var descriptionArr = new Array();

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

app.get("/lucky", function(req, res){
    res.render("lucky", {oneLineTxt:oneLineArr, yearsTxt:yearsArr, descriptionTxt:descriptionArr, moment:moment});
});

app.listen(8080, function(){
   console.log('8080 port Server On!');
});
