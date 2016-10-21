var mongoose = require("mongoose");

// DB schema
var luckySchema = mongoose.Schema({
  token : { type : String, required : true, unique:true },
  regDate : { type : String, required : true }
});

var Lucky = mongoose.model("lucky", luckySchema);

module.exports = Lucky;
