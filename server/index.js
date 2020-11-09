const express = require("express");

const bodyParser = require("body-parser");

const cors = require("cors");

const app = express();

app.use(bodyParser.json());

app.use(cors());


const port = 1022;


app.get('/', (req,res)=>{
    res.send('Hello World');
});


app.post('/program', (req,res)=>{
    var name = req.body.user;
    var password = req.body.password;
    console.log(`Username ${name} Password ${password}`);
});




app.listen(port, ()=>{
    console.log(`Server Started on Port ${port}`)
});
