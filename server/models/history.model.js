import mongoose from 'mongoose'

const historySchema=new mongoose.Schema({
    url:String,
    method:String,
    status:Number,
    response:{type:Object,default:{}},
    headers:{type:Object,default:{}},
    timestamp:{type:Date,default:Date.now},
    user_id:String

})


const History=mongoose.model('History',historySchema);
export default History;