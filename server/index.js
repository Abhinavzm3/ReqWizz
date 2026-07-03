import express from 'express';


const app=express();

app.get('/',(req,res)=>{

    res.send("Api is running");
})

app.listen(5000,()=>{
    console.log("app is running on PORT 5000");

})