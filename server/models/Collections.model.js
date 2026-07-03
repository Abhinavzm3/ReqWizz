// models/Collection.js
import mongoose from 'mongoose'
const requestSchema = new mongoose.Schema({
  name: String,
  url: String,
  method: String,
  headers: Object,
  body: String,

  createdAt:{type:Date,default:Date.now},
});

const collectionSchema = new mongoose.Schema({
  name: String,
  requests: [requestSchema],
  user_id:String,
});

const Collection = mongoose.model('Collection', collectionSchema);
export default Collection;