var mongoose = require("mongoose");

// DB schema
var unseSchema = mongoose.Schema({
  token:{type:String, required:true, unique:true},
  regDate:{type:Date, default:Date.now}
});

var Unse = mongoose.model("unse", unseSchema);

module.exports = Unse;
