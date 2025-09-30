const express = require("express");
const app = express()
const port = 4950;
const ejs = require("ejs");
app.set('view engine', 'ejs');
    
app.use(express.urlencoded({extended: true}))
// app.set('views', __dirname + '/models/views');
const mongoose = require("mongoose");


let URI = "mongodb+srv://adeolaprecious:pearl10@cluster0.abcw6bw.mongodb.net/project?retryWrites=true&w=majority&appName=Cluster0"

mongoose.connect(URI)
.then(()=>{
    console.log("Mongoose connected successfully");
})
.catch((error)=>{
    console.error("Mongoose connection error:", error);
})

app.get("/signup", (req,res)=>{
    res.render("signup")
})

app.listen(port, ()=>{
    console.log(`Server has started on port ${port}`);
    
})