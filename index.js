const express = require("express");
const app = express()
const port = 4950;
const ejs = require("ejs");
app.set('view engine', 'ejs');
const mongoose = require("mongoose");

const customerRouter = require ('./routes/user.route')


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const URI = process.env.URI


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



let allCustomers = []

app.use("/user", customerRouter);

const port = process.env.PORT || 4950 ;

app.listen(port, ()=>{
    console.log(`Server has started on port ${port}`);
    
})


