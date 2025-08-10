# UWAUWI - GitHub OAuth Authentication System

A secure and responsive sign-up and sign-in system using GitHub OAuth authentication with database integration.

## 🚀 Features

- **GitHub OAuth Integration**: Secure authentication using GitHub accounts
- **Database Storage**: User profiles stored in SQLite database
- **Responsive Design**: Clean, mobile-friendly interface
- **JWT Token Management**: Secure session handling
- **Error Handling**: User-friendly error messages
- **Session Management**: Persistent login sessions
- **Security Best Practices**: Environment variables for sensitive data

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js, Passport.js
- **Database**: SQLite3
- **Authentication**: GitHub OAuth 2.0, JWT
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Security**: Environment variables, session management

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd UWAUWI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your GitHub OAuth app credentials:
   ```env
   GITHUB_CLIENT_ID=your_github_client_id_here
   GITHUB_CLIENT_SECRET=your_github_client_secret_here
   SESSION_SECRET=your_random_session_secret_here
   JWT_SECRET=your_jwt_secret_here
   DATABASE_PATH=./database.db
   PORT=3000
   ```

4. **Create GitHub OAuth App**
   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Create a new OAuth App with:
     - Application name: UWAUWI
     - Homepage URL: `http://localhost:3000`
     - Authorization callback URL: `http://localhost:3000/auth/github/callback`
   - Copy Client ID and Client Secret to your `.env` file

## 🚀 Usage

1. **Start the server**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

2. **Access the application**
   - Open your browser and go to `http://localhost:3000`
   - Click "Sign in with GitHub" to authenticate
   - You'll be redirected to the dashboard upon successful login

## 📁 Project Structure

```
UWAUWI/
├── server.js              # Main Express server
├── database.js            # SQLite database configuration
├── package.json           # Node.js dependencies
├── .env.example           # Environment variables template
├── .gitignore            # Git ignore rules
├── README.md             # This file
└── public/               # Frontend static files
    ├── index.html        # Login page
    ├── dashboard.html    # User dashboard
    └── styles.css        # CSS styles
```

## 🔐 Security Features

- **OAuth 2.0**: Secure GitHub authentication
- **Environment Variables**: Sensitive data stored securely
- **JWT Tokens**: Secure session management
- **Session Security**: HTTP-only cookies, secure settings
- **Input Validation**: Sanitized database operations
- **Error Handling**: No sensitive information leaked in errors

## 🗄️ Database Schema

The application uses SQLite with the following user table structure:

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  github_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  access_token TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🛣️ API Routes

### Authentication Routes
- `GET /` - Login page
- `GET /auth/github` - Initiate GitHub OAuth
- `GET /auth/github/callback` - GitHub OAuth callback
- `POST /auth/logout` - Logout user

### Protected Routes
- `GET /dashboard` - User dashboard (requires authentication)
- `GET /api/user` - Get current user profile (requires authentication)

## 🎨 Frontend Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Clean, gradient-based design
- **Error Handling**: Visual feedback for authentication errors
- **Loading States**: Smooth transitions and loading indicators
- **Accessibility**: ARIA-compliant and keyboard navigation

## 🔧 Development

### Environment Setup
1. Copy `.env.example` to `.env`
2. Fill in your GitHub OAuth credentials
3. Generate secure random strings for secrets

### Database
The SQLite database is automatically created on first run. The database file will be created at the path specified in `DATABASE_PATH`.

### Running in Development
```bash
npm run dev  # Uses nodemon for auto-reload
```

## 🚀 Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use HTTPS and set `cookie.secure = true`
3. Use strong, unique secrets for `SESSION_SECRET` and `JWT_SECRET`
4. Configure proper domain in GitHub OAuth app settings

## 🐛 Troubleshooting

### Common Issues

1. **"GitHub OAuth App not found"**
   - Check your `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`
   - Ensure the callback URL matches your GitHub OAuth app settings

2. **Database errors**
   - Check that the application has write permissions for the database file
   - Ensure the `DATABASE_PATH` directory exists

3. **Session issues**
   - Make sure `SESSION_SECRET` is set in your `.env` file
   - Clear browser cookies if experiencing login issues

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

If you encounter any issues or have questions, please open an issue on the GitHub repository.