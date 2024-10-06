const bcrypt = require('bcrypt');

// Password to be hashed
const password = '1906';

// Generate salt
bcrypt.genSalt(10, (err, salt) => {
  if (err) {
    throw err;
  }

  // Hash password with salt
  bcrypt.hash(password, salt, (err, hash) => {
    if (err) {
      throw err;
    }
    
    // Store hash in your password DB
    console.log('Hashed password:', hash);
  });
});
