// Filename: auth-package.js
const express = require('express');
const jwt = require('jsonwebtoken');

class AuthenticationPackage {
  constructor(secretKey) {
    this.secretKey = secretKey;
    this.users = [
      { id: 1, username: 'user1', password: 'password1' },
      { id: 2, username: 'user2', password: 'password2' },
    ];
  }

  generateToken(user) {
    return jwt.sign({ id: user.id, username: user.username }, this.secretKey);
  }

  authenticate(req, res, next) {
    const token = req.header('Authorization');

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized - Token missing' });
    }

    jwt.verify(token, this.secretKey, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Forbidden - Invalid token' });
      }

      req.user = user;
      next();
    });
  }

  login(username, password) {
    const user = this.users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      const token = this.generateToken(user);
      return { message: 'Login successful', token };
    } else {
      return { message: 'Invalid credentials' };
    }
  }
}

// Example usage:
const app = express();
const auth = new AuthenticationPackage('your_secret_key');

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const result = auth.login(username, password);

  if (result.token) {
    res.json(result);
  } else {
    res.status(401).json(result);
  }
});

app.get('/protected-route', auth.authenticate, (req, res) => {
  res.json({ message: 'Welcome to the protected route, ' + req.user.username + '!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
