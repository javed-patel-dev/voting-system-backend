const mongoose = require('mongoose');
mongoose.set('strictQuery', true)
require('dotenv').config()

mongoose.connect(process.env.URL, {useNewUrlParser: true}, (err) => {
  if (err) {
    console.error('Error connecting to MongoDB:', err.message);
  } else {
    console.log('Connected to MongoDB');
  }
});

const db = mongoose.connection

db.on('connection', ()=>{
  console.log('Connected to MongoDB with new one');
})

db.on('error', (err)=>{
  console.error('Error connecting to MongoDB:', err);
})

db.on('disconnect',()=>{
  console.log('DB connection lost, Trying to reconnect.....')

  mongoose.connect(process.env.URL, {useNewUrlParser: true})

  console.log('Connected to MongoDB')
})

db.on('reconnect', ()=>{
  console.log('reconnected to DB')
})



module.exports = mongoose;