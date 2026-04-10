const express = require('express');
const mongoose = require('mongoose');


const app = express();
const port = 3000;

app.use(express.json());

// connect MongoDB trực tiếp
mongoose.connect('mongodb+srv://qldkmh_db_user:nOxCJf4m1xHMXmOZ@qldkmh.9t9ql4q.mongodb.net/QLDKMH')
    .then(() => console.log('✅ Connected MongoDB Atlas'))
    .catch(err => console.log(err));

// route
const courseRoute = require('./route/courseRoute');
const enrollmentRoute = require('./route/enrollmentRoute');

app.use('/courses', courseRoute);
app.use('/enrollments', enrollmentRoute);

app.listen(port, () => {
    console.log('Server running on port', port);
});