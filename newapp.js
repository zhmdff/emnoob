const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const db = require('./db');
const { authenticate } = require('./middleware');

const app = express();

app.use(session({
    secret: 'Oy76kSAqMV3N1jEO9TENnyWrDiFf67CO',
    resave: false,
    saveUninitialized: true
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'website/src')));

// Import route files
const commonRoutes = require('./routes/commonRoutes');
const adminRoutes = require('./routes/adminRoutes');
const moderatorRoutes = require('./routes/moderatorRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const studentRoutes = require('./routes/studentRoutes');

// Use the routes
app.use('/', commonRoutes); // Use commonRoutes without prefix
app.use('/admin', adminRoutes);
app.use('/moderator', moderatorRoutes);
app.use('/teacher', teacherRoutes);
app.use('/student', studentRoutes);

app.get('/', (req, res) => {
    res.redirect('/dashboard');
});

app.get('/dashboard', authenticate, (req, res) => {
    const username = req.session.username;
    const globalUserType = req.session.globalUserType || 'default';
    res.render('dashboard', { username, req, path: req.path, globalUserType });
});

app.post('/submit-form', authenticate, (req, res) => {
    const { name, company, email, phone, message } = req.body;

    if (!name || !company || !email || !phone || !message) {
        return res.status(400).send('All fields are required');
    }

    const sql = 'INSERT INTO info (name, company, email, phone, message) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [name, company, email, phone, message], (err, result) => {
        if (err) {
            return res.status(500).send('Error inserting form data into database');
        }
        console.log('Form data inserted into database');
        res.send('Form submitted successfully');
    });
});

function formatDate(dateString) {
    const dateParts = dateString.split('-');
    const year = dateParts[2];
    const month = dateParts[1];
    const day = dateParts[0];
    return `${year}-${month}-${day}`;
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
