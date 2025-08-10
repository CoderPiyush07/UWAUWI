require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const Database = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
const db = new Database(process.env.DATABASE_PATH);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport GitHub Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: '/auth/github/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user exists or create new user
    const userData = {
      githubId: profile.id,
      username: profile.username,
      email: profile.emails ? profile.emails[0].value : null,
      avatarUrl: profile.photos ? profile.photos[0].value : null,
      accessToken: accessToken
    };

    const result = await db.upsertUser(userData);
    
    // Find the complete user record
    const user = await db.findUserByGithubId(profile.id);
    
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.findUserById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
};

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// GitHub OAuth routes
app.get('/auth/github', 
  passport.authenticate('github', { scope: ['user:email'] })
);

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/?error=auth_failed' }),
  (req, res) => {
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: req.user.id, 
        githubId: req.user.github_id,
        username: req.user.username 
      },
      process.env.JWT_SECRET || 'fallback-jwt-secret',
      { expiresIn: '24h' }
    );

    // Set token as cookie and redirect to dashboard
    res.cookie('auth_token', token, { 
      httpOnly: true, 
      secure: false, // Set to true in production
      maxAge: 24 * 60 * 60 * 1000 
    });
    
    res.redirect('/dashboard');
  }
);

// Logout route
app.post('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('auth_token');
    res.json({ message: 'Logged out successfully' });
  });
});

// User profile route
app.get('/api/user', requireAuth, (req, res) => {
  const { access_token, ...userWithoutToken } = req.user;
  res.json(userWithoutToken);
});

// Dashboard route
app.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  db.close();
  process.exit(0);
});