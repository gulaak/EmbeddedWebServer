const { Router, response } = require("express");
//const UserItemModel = require('../../models/UserItemModel');
const multer = require("multer");
const path = require('path') 
var fs = require('fs');
const router = Router();


var io = require('socket.io')(5000);



io.sockets.on('connection',(socket) => { console.log("Connected") });



// const storage = multer.diskStorage({
//     destination: function(req, file, cb) {
//         cb(null, '/');
//     },
  
//     // By default, multer removes file extensions so let's add them back
//     filename: function(req, file, cb) {
//         cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//     }
//   }); 

var upload = multer();


router.post('/uploadfile', upload.single('myFile'), (req, res, next) => {
    const file = req.file
    var data = req.file.buffer.toString();
    io.emit('my message', data);
    if (!file) {
      const error = new Error('Please upload a file')
      error.httpStatusCode = 400
      return next(error)
    }
    
   
    res.redirect("http://localhost:8081");
    
});


module.exports = router 