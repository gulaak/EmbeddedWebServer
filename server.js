const express = require('express')
const app = express()
const mongoose = require('mongoose')
const { PORT, mongoUri } = require('./config')
const cors = require('cors')
const morgan = require('morgan')
const bodyParser = require('body-parser')

//const userItemRoutes = require('./routes/api/UserItems')
//const uploadFileRoutes = require('./routes/api/file');
const path = require('path')

app.use(cors())
app.use(morgan('tiny'))
app.use(bodyParser.json())


const PeripheralModel = require('./models/PeripheralModel'); // grab data base model
const { delimiter } = require('path')



// mongoose.connect(mongoUri, {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useUnifiedTopology: true,
//     useFindAndModify: false

// }).then(()=> console.log('MongoDB database Connected'))
//   .catch((err)=> console.log(err));

//app.use('/api/UserItems', userItemRoutes);
//app.use('/api/file', uploadFileRoutes);
  
// app.get('/', (req,res)=>{
//     res.send("Hello World");
// });

//var server = app.listen(PORT, '10.0.0.72',  ()=>{ console.log(`Server Started Listening on ${PORT}`)});


var server = app.listen(PORT, ()=>{ console.log(`Server Started Listening on ${PORT}`)});


var state = {
  UART1: [false,0,[]],
  UART4: [false,0,[]],
  I2C: [false,0,[]],
  SPI: [false,0,[]],
  GPIO_49:[false,0,[]],
  GPIO_60:[false,0,[]],
  GPIO_117:[false,0,[]],
  GPIO_115:[false,0,[]],
  GPIO_112:[false,0,[]],
  GPIO_20:[false,0,[]],
  GPIO_66:[false,0,[]],
  GPIO_69:[false,0,[]],
  GPIO_45:[false,0,[]],
  GPIO_47:[false,0,[]],
  GPIO_27:[false,0,[]],
  GPIO_67:[false,0,[]],
  GPIO_68:[false,0,[]],
  GPIO_44:[false,0,[]],
  GPIO_26:[false,0,[]],
  GPIO_46:[false,0,[]],
  GPIO_65:[false,0,[]],
  GPIO_61:[false,0,[]],
  PWM0:[false,0,[]],
  PWM1A:[false,0,[]],
  PWM1B:[false,0,[]],
  PWM2A:[false,0,[]],
  PWM2B:[false,0,[]],
  AIN0:[false,0,[]],
  AIN1:[false,0,[]],
  AIN2:[false,0,[]],
  AIN3:[false,0,[]],
  AIN4:[false,0,[]],
  AIN5:[false,0,[]],
  AIN6:[false,0,[]]
};

const db_id = "5fa0ad64449b780963d4badb";

async function add_new_item(){
  
  var new_item = await PeripheralModel.findByIdAndUpdate(db_id, x );
  console.log("New Item " + new_item)
}

//add_new_item();

var io = require('socket.io')(server);
io.sockets.on('connection', newConnection);


function newConnection(socket){

  io.to(socket.id).emit("peripheral status", state) // give client peripheral state
  socket.on('release', (ID)=>{
    releaseResource(ID); // releases resource requested by the client user (client must )
  });
  
  socket.on('file message', (data,ID) =>{
    handleFile(data,ID)
  });
  socket.on('compile error', (ID)=> { io.to(ID).emit("compile error")}); // Compile Failed
  socket.on('compile success', (ID)=> { io.to(ID).emit("compile success")}); // Compile Worked and Is running on device
  // update state of database for usage of ports
}

function notifyUsers(new_item){
  console.log("Done with async call");  
  io.sockets.emit('peripheral status', new_item[0].toObject());
  //io.sockets.emit("send file", new_item[2], new_item[1]); // BeagleBone will be only client listening to this (Must track ID of socket)
}

function notifyUser(new_item){
  io.to(new_item[1]).emit("peripheral status", new_item[0].toObject());

}




var id_map = {} // map that shows which ID holds what resource
var running = {} // map that shows which ID is running 

function handleFile(data,ID){
  console.log(data);
  console.log(data.split('\n'))
  new_entry = extract_peripherals(data.split('\n')); // send array of lines
  //file parsing will need to handle gerneation of new_entry;
  var failed = false;
  for( var item in new_entry){ // iterate over keys of peripherals program wants to control
    var query = ""
    try {
      query = state[item][0];
    } catch(err){
      continue;
    }
    if(query == true){ 
      new_entry["program"] = data // put program into the new_entry
      new_entry["ID"] = ID
      state[item][2].push(new_entry)  // peripheral utilized 
      failed = true
      
    }
  }
  if( failed )return; 
  //new_entry = {uart1: [true,0], uart4: [true, 0]};
  id_map[ID] = new_entry // keep track of which ID has what resource 
  running[ID] = true
  updateState(new_entry, true)
  console.log(state)
  io.sockets.emit('peripheral status', state ); // update all clients
  io.sockets.emit('send program', data, ID);
}

function releaseResource(ID){ // when we release a resource we try to dispatch any programs that is waiting for that resource
  var peripherals = ""
  try { 
    peripherals = id_map[ID]; // get the peripherals associated with this socket ID
  }
  catch(err){
    return; // that ID doesnt have any peripherals ( nothin needs to be done )
  }
  id_map[ID] = {} //
  new_resource_map = {}
  updateState(peripherals, false) // release all peripherals acording to this socket ID 
  for(var item in peripherals){
    if( state[item][2].length == 0){ // nothing is waiting
      continue;
    } else { // entries are waiting evaluate them in a fifo manner
      entry_num = 0;
      for( var entry of state[item][2]){
        valid = true;
        map = {}
        for( var key in entry){ // check if all other peripherals are available
          if(key == "program" || key == "ID")continue; // disregard program key and socket ID
          if(state[key][0]== true){
            valid = false; // cannot dispatch
            break;
          }
          map[key] = entry[key]
        }
        if(valid && !running[entry["ID"]]){
          new_resource_map = {...new_resource_map, ...map}
          io.sockets.emit("send program",[entry["program"],entry["ID"]]) // dispatch program to BeagleBone 
          running[entry["ID"]] = true // now running 
          state[item][2].splice(entry_num,1) // remove the element
        }
        entry_num++
      }
    }
  }
  if( Object.keys(new_resource_map).length != 0){ // if we dispatch new processes ( update state table )
    updateState(new_resource_map,true)
    
  }
  io.sockets.emit("peripheral status",state) // update global peripheral state 


}

function updateState(resource_map, update_state){
  for(var key in resource_map){
    if( (key.match("GPIO") && resource_map[key]) || key.match("pwm") ){
      state[key][0] = update_state
     
    }
    if( !update_state){
      state[key][0] = update_state // peripheral is now used
      state[key][1] = state[key][1] - 1
    } else{
      state[key][1] = state[key][1] + 1
    }
  }
}


function extract_peripherals(line_array){
  var collection  = [ "GPIO(", "UART(", "I2C(", "SPI(", "PWM(" ]
  var peripherals = {}
  for( var line of line_array){
    console.log(line)
    var newLine = line.split(' ').join(''); // get rid of all spaces
    console.log(newLine)
    for( var delim of collection){
      var status = ""
      console.log(delim)
      if(delim == "GPIO("){
        status = extract_first_two_args( newLine, delim );
        console.log("Status " + status )
        if( status.length > 0){
          key = delim.substring(0,delim.length-1) + "_" + status[0];
          peripherals[key] = (status[1]=="1")? 1 : 0; 
        }
      } 
      else{
        status = extract_first_arg( newLine , delim );
        if( status.length > 0){

          key = delim.substring(0,delim.length-1)
          if(delim == "UART("){
            key += status[0]
          }
          peripherals[key] = 0
        }
      }
    }
  }
  console.log(peripherals)
  return peripherals;
}

function extract_first_two_args ( newLine , delimiter_string  ){
  if ( !newLine.includes(delimiter_string)){
    return false
  } else {
    first_arg = newLine.split('(').pop().split(',')[0]
    second_arg = newLine.split(',').pop().split(')')[0]
    return [first_arg, second_arg ]
  }
}

function extract_first_arg(newLine , delimiter_string ){
  if ( !newLine.includes(delimiter_string)){
    return false
  } else {
    first_arg = newLine.split('(').pop().split(')')[0]
    return [first_arg,0];
  }
}





