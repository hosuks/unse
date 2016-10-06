var express = require('express');
var app = express();
var request = require("request");
var cheerio = require("cheerio");

var url = "http://www.elle.co.kr/lovenlife/Horoscope.asp?MenuCode=en010405";
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
     console.log($(this).find("img").attr('src'));
     console.log($(this).find("span.tit img").attr('src'));
     console.log($(this).find("span.txt").text());

     img.push($(this).find("img").attr('src'));
     alt.push($(this).find("span.tit img").attr('alt'));
     description.push($(this).find("span.txt").text());
  });
});

app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));

app.get("/", function(req, res){
  res.render("main", {img:img, alt:alt, description:description, termDate:termDate});
});

app.listen(5000, function(){
   console.log('Server On!');
});
