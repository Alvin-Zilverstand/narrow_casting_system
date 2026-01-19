# Contributing to SnowWorld Narrowcasting System

Thank you for your interest in contributing to the SnowWorld Narrowcasting System! This document provides guidelines and instructions for contributing to the project.

## 🎯 Project Overview

This is a narrowcasting system developed for SnowWorld as part of an MBO Challenge. The system manages and displays content on various screens within the ski resort.

## 🏗️ Architecture

- **Backend**: Node.js with Express
- **Database**: SQLite
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Real-time**: WebSocket (Socket.io)

## 🚀 Quick Start

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/narrow-casting-system.git`
3. Install dependencies: `npm run setup`
4. Start development: `npm run dev`

## 📋 Development Guidelines

### Code Style

- Use consistent indentation (2 spaces)
- Follow camelCase for variables and functions
- Use descriptive variable names
- Add comments for complex logic
- Keep functions small and focused

### File Structure

```
backend/
├── server.js           # Main server file
├── database/           # Database logic
├── services/           # Business logic
└── utils/             # Utility functions

admin/
├── index.html         # Main HTML
├── styles.css         # Styles
└── js/                # JavaScript modules

client/
├── index.html         # Display HTML
├── styles.css         # Display styles
└── js/                # Display logic
```

### Commit Messages

Use clear, descriptive commit messages:
- `feat: add real-time content updates`
- `fix: resolve WebSocket connection issues`
- `docs: update API documentation`
- `style: improve responsive design`

## 🔧 Development Process

### 1. Backend Development

```bash
cd backend
npm run dev  # Starts with nodemon for auto-reload
```

### 2. Frontend Development

For admin dashboard:
```bash
cd admin
npm start    # Serves on http://localhost:8080
```

For client display:
```bash
# Open client/index.html in browser
# Or use live server for development
```

### 3. Testing

Run system tests:
```bash
node test_system.js
```

## 🐛 Bug Reports

When reporting bugs, please include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser/environment info
- Screenshots if applicable

## 💡 Feature Requests

For feature requests, please:
- Check if the feature already exists
- Describe the use case clearly
- Explain why this feature would be valuable
- Consider implementation complexity

## 🔒 Security

### Reporting Security Issues

**DO NOT** report security vulnerabilities publicly. Instead:
1. Email security concerns to: [security@snowworld.com]
2. Include detailed description of the vulnerability
3. Provide steps to reproduce if possible
4. Allow time for investigation before disclosure

### Security Guidelines

- Never commit sensitive data (passwords, API keys)
- Validate all user inputs
- Use parameterized queries
- Implement proper CORS policies
- Keep dependencies updated

## 📊 Performance Guidelines

- Minimize database queries
- Use appropriate indexing
- Implement caching where beneficial
- Optimize file uploads
- Consider bandwidth limitations

## 🎨 UI/UX Guidelines

### Design Principles
- Keep the winter/snow theme consistent
- Ensure high contrast for readability
- Make interfaces intuitive and simple
- Consider different screen sizes
- Test on various devices

### Color Scheme
- Primary: #0066cc (blue)
- Secondary: #e6f3ff (light blue)
- Accent: #00a8ff (bright blue)
- Background: Blue to purple gradients
- Text: High contrast with backgrounds

## 📝 Documentation

- Update README.md for new features
- Document API changes
- Include code comments for complex logic
- Update technical documentation

## 🔄 Deployment

### Development
```bash
npm run dev     # Development server
npm run admin   # Admin dashboard
```

### Production
```bash
npm start       # Production server
npm run build   # Build for production
```

## 📋 Pull Request Process

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Make your changes following the guidelines
3. Test thoroughly
4. Commit with descriptive messages
5. Push to your fork: `git push origin feature/amazing-feature`
6. Create a Pull Request with:
   - Clear title and description
   - List of changes made
   - Screenshots for UI changes
   - Test results

### PR Requirements
- All tests must pass
- No linting errors
- Documentation updated
- Code reviewed by maintainer

## 🏷️ Version Management

We use semantic versioning:
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes

## 📞 Support

For questions and support:
- Check existing documentation
- Search closed issues
- Create a new issue with proper labels
- Be patient and respectful

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to the SnowWorld Narrowcasting System! ❄️