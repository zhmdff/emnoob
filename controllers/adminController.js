const db = require('../db');

app.post('/adminLogin', (req, res) => {
    const { username, password } = req.body;
  
    // Check if username exists
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Internal server error');
      }
      console.log(results);
  
      if (results.length === 0) {
        return res.status(400).send('Username does not exist');
      }
  
      // Compare password with hashed password
      const hashedPassword = results[0].password;
      bcrypt.compare(password, hashedPassword, (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Internal server error');
        }
  
        if (result) {
          // Passwords match, authentication successful
          req.session.username = results[0].username;
          req.session.userType = results[0].userType;
          console.log(req.session.username);
          console.log(req.session.userType);
      
          // Redirect to appropriate dashboard based on userType
          switch (results[0].userType) {
            case 'admin':
              globalUserType = 'admin';
              break;
            case 'moderator':
              globalUserType = 'moderator';
              break;
            case 'teacher':
              globalUserType = 'teacher';
              break;
            case 'student':
              globalUserType = 'student';
              break;
            default:
              return res.status(401).send('Unauthorized');
          }
          return res.redirect('/dashboard');
      } else {
          // Passwords don't match
          return res.status(401).send('Incorrect password');
        }
      });
    });
  });

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
