const express = require('express');
const mongoose = require('mongoose');


const app = express();
const port = 3000;

app.use(express.json());

// connect MongoDB trực tiếp
mongoose.connect('mongodb://127.0.0.1:27017/QLDKMH')
    .then(() => console.log('✅ Connected MongoDB'))
    .catch(err => console.log(err));

// route


app.listen(port, () => {
    console.log('Server running on port', port);
});