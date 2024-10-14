const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const user = require('./routes/user');
const employee = require('./routes/employee');

const app = express();

app.use(bodyParser.json());

// Connect to mongodb
mongoose.connect('mongodb://localhost:27017/comp3123_assignment1')
    .then(() => console.log('MongoDB connected')) // Verify connection
    .catch(err => console.error('MongoDB connection error:', err));


// 2 route for user and emp, connected to the different endpoints
app.use('/api/v1/user', user);
app.use('/api/v1/emp', employee);


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server has started running on port ${PORT}`);
});

