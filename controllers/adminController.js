const db = require('../db');

const getStudentForm = (req, res) => {
    const sql = 'SELECT * FROM groups';
    db.query(sql, (err, rows) => {
        if (err) {
            return res.status(500).send('Error fetching data from database');
        }
        const username = req.session.username;
        res.render('student_form', { info: rows, username, req, path: req.path, globalUserType });
    });
};

const getStudentTable = (req, res) => {
    const sql = 'SELECT * FROM students';
    db.query(sql, (err, rows) => {
        if (err) {
            return res.status(500).send('Error fetching data from database');
        }
        const username = req.session.username;
        res.render('student_table', { info: rows, username, req, path: req.path, globalUserType });
    });
};

const getGroupTable = (req, res) => {
    const sql = 'SELECT * FROM groups';
    db.query(sql, (err, rows) => {
        if (err) {
            return res.status(500).send('Error fetching data from database');
        }
        const username = req.session.username;
        res.render('group_table', { info: rows, username, req, path: req.path, globalUserType });
    });
};

const getGroupInfo = (req, res) => {
    const groupNumber = req.params.group_number;
    const sql = 'SELECT * FROM students WHERE group_name = ?';
    db.query(sql, [groupNumber], (err, rows) => {
        if (err) {
            return res.status(500).send('Error fetching students');
        }
        res.render('student_list', { info: rows, username: req.session.username, req, path: req.path, globalUserType });
    });
};

module.exports = {
    getStudentForm,
    getStudentTable,
    getGroupTable,
    getGroupInfo
};
