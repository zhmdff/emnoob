const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mysql = require('mysql');
const path = require('path');
const session = require('express-session');
const db = require('./db')

const app = express();

app.use(session({
    secret: 'Oy76kSAqMV3N1jEO9TENnyWrDiFf67CO',
    resave: false,
    saveUninitialized: true
}));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static files from the 'website/src' directory
app.use(express.static(path.join(__dirname, 'website/src')));

let globalUserType = 'default';

var authenticate = function (req, res, next) {

  console.log(req.session)

  var isAuthenticated = req.session.username ? true : false;

  var userType = req.session.userType;
  globalUserType = userType;

  var Gusername = req.session.username;
  globalUsername = Gusername;

  if (isAuthenticated) {
    next();
  } else {
    // Redirect to login for unauthenticated users
    if (req.url !== '/login' && req.url !== '/register') {
      return res.redirect('/login');
    } else {
      next();
    }
  }
};


//                    ROUTES

app.get('/admin_login', (req, res) => {
  const isLoginPage = true;
  const username = req.session.username || '';

  if (username) {
      return res.redirect('/dashboard');
  }

  res.render('admin_login', { isLoginPage, username, req, path: req.path, globalUserType: 'default' });
});

app.get('/login', (req, res) => {
  const isLoginPage = true; // Set a variable to indicate it's a login page
  const username = req.session.username || ''; // Retrieve username from session or default to empty string
  
  // Check if the user is already logged in
  if (username) {
    return res.redirect('/dashboard'); // Redirect to the dashboard or home page if already logged in
  }
  
  res.render('login', { isLoginPage, username, req, path: req.path, globalUserType });
});

app.get('/', (req, res) => {
  res.redirect('/dashboard');
});

app.get('/dashboard', authenticate, (req, res) => {
  const username = req.session.username;
  res.render('dashboard', { username, req, path: req.path, globalUserType  });
});

app.get('/student/form',authenticate, (req, res) => {
  if (globalUserType === 'admin') {
    const sql = 'SELECT * FROM groups';
    db.query(sql, (err, rows) => {
      if (err) {
        return res.status(500).send('Error fetching data from database');
      }
      const username = req.session.username;
      res.render('student_form', { info: rows, username, req, path: req.path, globalUserType });
    });
  }else{
    res.status(403).send('Access forbidden');
  }
});






app.get('/logout',authenticate, (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.log(err);
    } else {
      res.redirect('/login'); // Redirect to the login page after logging out
    }
  });
});



app.get('/student/table', authenticate, (req, res) => {
  if (globalUserType === 'admin' || globalUserType === 'moderator' || globalUserType === 'student' || globalUserType === 'teacher'){
  const sql = 'SELECT * FROM students';
  db.query(sql, (err, rows) => {
    if (err) {
      return res.status(500).send('Error fetching data from database');
    }
    const username = req.session.username;
    res.render('student_table', { info: rows, username, req, path: req.path, globalUserType });
  });
  }else{
    res.status(403).send('Access forbidden');
  }
});


// app.get('/group/table',authenticate, (req, res) => {
//   if (globalUserType === 'admin' || globalUserType === 'moderator' || globalUserType === 'student' || globalUserType === 'teacher'){
//   const sql = 'SELECT * FROM groups';

//   // Execute the query
//   db.query(sql, (err, rows) => {
//     if (err) {
//       return res.status(500).send('Error fetching data from database');
//     }

//     const username = req.session.username;
//     res.render('group_table', { info: rows, username, req, path: req.path, globalUserType });
//   });
//   }else{
//     res.status(403).send('Access forbidden');
//   }
// });


app.get('/group/table', authenticate, (req, res) => {
  const username = req.session.username; // Retrieve username from session

  if (globalUserType === 'admin' || globalUserType === 'moderator') {
    // If the user is an admin or moderator, fetch all groups
    const sql = 'SELECT * FROM groups';

    db.query(sql, (err, rows) => {
      if (err) {
        return res.status(500).send('Error fetching data from database');
      }
      res.render('group_table', { info: rows, username, req, path: req.path, globalUserType });
    });

  } else if (globalUserType === 'student' || globalUserType === 'teacher') {
    // If the user is a student or teacher, fetch only their group
    const usersGroup = 'SELECT group_name FROM students WHERE username = ?';

    db.query(usersGroup, [username], (err, rows) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error fetching data from database');
      }

      console.log(rows);

      // Check if rows contain data
      if (rows.length > 0) {
        const usGroup = rows[0].group_name; // Accessing the group_name from the first row
        console.log('User Group:', usGroup); // Log the value of usGroup for verification

        const sql = 'SELECT * FROM groups WHERE group_name = ?';

        // Execute the query to get the specific group
        db.query(sql, [usGroup], (err, groupRows) => {
          if (err) {
            console.log(err);
            return res.status(500).send('Error fetching data from database');
          }

          // Render the view with the user-specific group data
          res.render('group_table', { info: groupRows, username, req, path: req.path, globalUserType });
        });

      } else {
        // Handle case where no group is found for the user
        res.render('group_table', { info: [], username, req, path: req.path, globalUserType });
      }
    });
  } else {
    res.status(403).send('Access forbidden');
  }
});





app.get('/group/info/:group_number', authenticate, (req, res) => {
  const groupNumber = req.params.group_number;

  if (globalUserType === 'admin') {
    // Admin can see all students in the specified group
    const sql = 'SELECT * FROM students WHERE group_name = ?';

    db.query(sql, [groupNumber], (err, rows) => {
      if (err) {
        console.error('Error fetching students:', err);
        return res.status(500).send('Error fetching students');
      }

      res.render('student_list', { info: rows, username: req.session.username, req, path: req.path, globalUserType });
    });
  
  } else if (globalUserType === 'student' || globalUserType === 'teacher') {
    // Students and teachers can only see their own group
    const usersGroupQuery = 'SELECT group_name FROM students WHERE username = ?'; // Assuming username is stored in the session

    db.query(usersGroupQuery, [req.session.username], (err, rows) => {
      if (err) {
        console.error('Error fetching user group:', err);
        return res.status(500).send('Error fetching user group');
      }

      // Check if rows contain data
      if (rows.length > 0) {
        const userGroup = rows[0].group_name;

        if (userGroup === groupNumber) {
          // If the user belongs to the requested group, fetch the students
          const sql = 'SELECT * FROM students WHERE group_name = ?';

          db.query(sql, [userGroup], (err, students) => {
            if (err) {
              console.error('Error fetching students:', err);
              return res.status(500).send('Error fetching students');
            }

            res.render('student_list', { info: students, username: req.session.username, req, path: req.path, globalUserType });
          });
        } else {
          // User does not belong to the requested group
          res.status(403).send('Access forbidden: You do not belong to this group.');
        }
      } else {
        // Handle case where no group is found for the user
        res.status(404).send('User group not found.');
      }
    });
  } else {
    res.status(403).send('Access forbidden');
  }
});






//                            ROUTES






//                            POST
  



app.post('/form-login', (req, res) => {
  const { username, password } = req.body;

  // Check if username exists
  db.query('SELECT * FROM students WHERE username = ?', [username], (err, results) => {
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


app.post('/admin-login', (req, res) => {
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



app.post('/submit-form',authenticate, (req, res) => {
  const { name, company, email, phone, message } = req.body;

  if (!name || !company || !email || !phone || !message) {
    return res.status(400).send('All fields are required 1');
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


app.post('/student-form',authenticate, (req, res) => {
  const { name, surname, username, password, email, phone_number, address, group_name, birthdate, course,education_type } = req.body;
  console.log(birthdate)

  if (!name || !surname || !username || !password || !email || !phone_number || !address || !group_name || !birthdate || !course || !education_type) {
      console.log(req.body);
      return res.status(400).send('All fields are required 2');
  }

  function formatDate(birthdate) {
    const dateObj = new Date(birthdate);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Convert birthdate to YYYY-MM-DD format
  const formattedBirthdate = formatDate(birthdate);

  bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
          return res.status(500).send('Error hashing password');
      }

      const sql = 'INSERT INTO students (name, surname, username, password, email, phone_number, address_line, group_name, birthdate, course, education_type, userType) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "student")';
      db.query(sql, [name, surname, username, hashedPassword, email, phone_number, address, group_name, formattedBirthdate, course, education_type], (err, result) => {
          if (err) {
            console.log(err)
              return res.status(500).send('Error inserting form data into database');
          }
          console.log('Form data inserted into database');
          res.redirect('/student/table');
      });
  });
});

app.get('/group/form',authenticate, (req, res) => {
  const sql = 'SELECT * FROM groups';
  db.query(sql, (err, rows) => {
    if (err) {
      return res.status(500).send('Error fetching data from database');
    }
    const username = req.session.username;
    res.render('group_form', { info: rows, username, req, path: req.path, globalUserType });
  });

});

app.post('/group-form', authenticate, (req, res) => {
  const { name, number } = req.body;

  if (!name || !number) {
    return res.status(400).send('All fields are required 3');
  }

  const sql = 'INSERT INTO groups (group_name, group_number) VALUES (?, ?)';
  db.query(sql, [name, number], (err, result) => {
    if (err) {
      console.error(err); // Log the error for debugging
      return res.status(500).send('Error inserting form data into database');
    }
    console.log('Form data inserted into database');
    res.redirect('/group/table');
  });
});

// app.get('/form',authenticate, (req, res) => {
//   const username = req.session.username;
//   res.render('form', { username, req, path: req.path, globalUserType });
// });

// app.get('/loginz', (req, res) => {
//   res.render('loginz'); // Pass the variable to the template
// });

// app.get('/table',authenticate, (req, res) => {
//   // Query to fetch data from the info table
//   const sql = 'SELECT * FROM info';

//   // Execute the query
//   db.query(sql, (err, rows) => {
//     if (err) {
//       return res.status(500).send('Error fetching data from database');
//     }

//     const username = req.session.username; // Retrieve the username from the session
//     // Render the 'table' view and pass the fetched data to the template
//     res.render('dashboard', { info: rows, username, req, path: req.path, globalUserType });
//   });
// });




//                            POST

  


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
