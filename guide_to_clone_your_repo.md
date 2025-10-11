# 🚀 Système de Gestion de Paiement

A full-stack payment management system with separate frontend and backend components.

## 🎯 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/systeme-gestion-paiement.git
cd systeme-gestion-paiement
```

### 2. Always Sync Before Starting Work

```bash
git pull origin main
```

---

## 💻 Frontend Setup

### Installation & Running

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Frontend Development Workflow

```bash
# 1. Create a feature branch
git checkout -b feature/frontend-ui

# 2. Build your components and test locally

# 3. Stage your changes
git add .

# 4. Commit with a descriptive message
git commit -m "Add home page UI"

# 5. Push to GitHub
git push origin feature/frontend-ui

# 6. Create a Pull Request on GitHub for code review
```

---

## ⚙️ Backend Setup

### Installation & Running

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start development server
npm run dev
# or
node server.js
```

### Backend Development Workflow

```bash
# 1. Create a feature branch
git checkout -b feature/backend-auth

# 2. Develop your APIs and test locally

# 3. Stage your changes
git add .

# 4. Commit with a descriptive message
git commit -m "Add authentication routes"

# 5. Push to GitHub
git push origin feature/backend-auth

# 6. Open a Pull Request to merge into main
```

---

## 🤝 Team Workflow Guidelines

### ✅ Best Practices

| Rule | Description |
|------|-------------|
| **Always sync first** | Run `git pull origin main` before starting new work |
| **Use feature branches** | Name them clearly (e.g., `feature/frontend-login`, `feature/backend-auth`) |
| **Never commit dependencies** | Ensure `node_modules/` is in `.gitignore` |
| **Test locally** | Always test your changes before pushing |
| **Write clear commits** | Keep messages short and descriptive |
| **Code reviews** | Use Pull Requests for team review before merging |

### Branch Naming Convention

- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates

### Commit Message Examples

```bash
git commit -m "Add user authentication form"
git commit -m "Fix payment validation bug"
git commit -m "Update API documentation"
git commit -m "Refactor database connection logic"
```

---

## 📁 Project Structure

```
systeme-gestion-paiement/
├── frontend/          # React frontend application
│   ├── src/
│   ├── package.json
│   └── ...
├── backend/           # Node.js backend server
│   ├── routes/
│   ├── server.js
│   ├── package.json
│   └── ...
├── .gitignore
└── README.md
```

---

## 🛠️ Tech Stack

**Frontend:**
- React
- Vite/Create React App
- [Add other frontend technologies]

**Backend:**
- Node.js
- Express
- [Add database technology]
- [Add other backend technologies]

---

## 🚦 Quick Reference

### Common Git Commands

```bash
# Check current branch
git branch

# Switch to main branch
git checkout main

# Pull latest changes
git pull origin main

# Check status of files
git status

# View commit history
git log --oneline

# Discard local changes
git checkout -- <file>
```

### Troubleshooting

**Problem:** Merge conflicts
```bash
# Pull latest changes
git pull origin main
# Resolve conflicts in your editor
# Then commit the resolved changes
git add .
git commit -m "Resolve merge conflicts"
```

**Problem:** Need to undo last commit
```bash
git reset --soft HEAD~1  # Keeps changes staged
# or
git reset --hard HEAD~1  # Discards changes completely
```

---

## 📝 License

[Add your license information here]

---

## 👥 Contributors

[Add contributor information or link to contributors page]

---

## 📞 Support

For questions or issues, please open an issue on GitHub or contact the team leads.