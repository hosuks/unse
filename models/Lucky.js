var mongoose = require("mongoose");

// DB schema
var luckySchema = mongoose.Schema({
  token:{type:String, required:true, unique:true},
  regDate:{type:Date, default:Date.now}
});

var Lucky = mongoose.model("lucky", luckySchema);

module.exports = Lucky;
