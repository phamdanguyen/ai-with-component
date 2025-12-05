# Git Workflow Guide
## All-in-One Chat Sprint 1

**Version**: 1.0
**Purpose**: Standardized git workflow for team coordination

---

## 🌳 Branch Strategy

### Main Branch
```
main/
  ├─ Always deployable (builds, tests pass)
  ├─ Protected (requires PR review)
  └─ All PRs merged here after review
```

### Feature Branches
```
feat/<story-number>-<short-description>/
  ├─ Example: feat/e1-s1-chat-interface
  ├─ Example: feat/e1-s2-message-display
  ├─ One story = one branch
  └─ Base from: main
```

---

## 📋 Daily Workflow

### **Morning** (Start of Day)

#### 1. Pull Latest Changes
```bash
# Make sure you have latest code
git checkout main
git pull origin main

# Now create feature branch
git checkout -b feat/e1-s1-chat-interface
```

#### 2. Verify Your Branch
```bash
# Check you're on correct branch
git branch -v

# Output should show:
#   main                    abc1234 [origin/main]
# * feat/e1-s1-chat-interface abc1234
```

### **During Day** (Every Hour or When Complete)

#### Commit Often (Small, Focused Commits)
```bash
# Check what changed
git status

# Stage changes
git add apps/web/components/chat/ChatInterface.tsx

# Commit with descriptive message
git commit -m "feat: E1.S1 - Create ChatInterface component with input field"

# Verify commit
git log --oneline | head -3
```

#### Good Commit Messages
```
✅ GOOD:
  feat: E1.S1 - Add input field to ChatInterface
  feat: E1.S1 - Style message bubbles with Tailwind
  fix: E1.S1 - Fix responsive layout on mobile

❌ BAD:
  update
  fixed stuff
  wip
  asdf
```

#### Example Commit Flow
```bash
# 9:00 AM - Create component skeleton
git add apps/web/components/chat/ChatInterface.tsx
git commit -m "feat: E1.S1 - Create ChatInterface component skeleton"

# 10:00 AM - Add input field
git add apps/web/components/chat/ChatInterface.tsx
git commit -m "feat: E1.S1 - Add input field with placeholder"

# 11:00 AM - Add send button
git add apps/web/components/chat/ChatInterface.tsx
git commit -m "feat: E1.S1 - Add send button and click handler"

# 12:00 PM - Add styling
git add apps/web/components/chat/ChatInterface.tsx
git commit -m "feat: E1.S1 - Style with Tailwind CSS"

# Result: 4 commits, easy to review
```

### **End of Day** (Before Leaving)

#### Push Your Branch
```bash
# First verify all tests pass
pnpm test
pnpm build

# If tests pass, push
git push origin feat/e1-s1-chat-interface

# Verify push succeeded
git log origin/feat/e1-s1-chat-interface -3
```

#### Update Team
```
Post to Slack:
"✅ Pushed E1.S1 progress - ChatInterface component with input field
 Tests: Passing
 Build: Passing
 Ready for code review tomorrow"
```

---

## 🔄 Code Review & Merge

### **Creating a Pull Request**

#### Step 1: Push Branch (If Not Done)
```bash
git push origin feat/e1-s1-chat-interface
```

#### Step 2: Create PR
**On GitHub/GitLab**:
1. Go to repository
2. Click "Create Pull Request" button
3. From: `feat/e1-s1-chat-interface` → To: `main`
4. Fill out PR template (see `.github/pull_request_template.md`)
5. Click "Create Pull Request"

#### Step 3: Request Review
```
PR Title: "feat: E1.S1 - Chat Interface UI"

Select Reviewers:
  - Backend Lead (or whoever)

Add Comment:
  "Ready for review! Tests passing, build green."
```

### **Reviewing a PR**

#### Reviewer Checklist
```
1. Does it match the user story acceptance criteria?
   ☐ Yes ☐ No

2. Is the code quality good?
   ☐ Tests added
   ☐ Tests passing
   ☐ No console errors
   ☐ Follows style guide
   ☐ No suspicious patterns

3. Is it deployable?
   ☐ Build passes
   ☐ No TypeScript errors
   ☐ No merge conflicts
   ☐ Proper git history

4. Approve?
   ☐ Approve (merge when ready)
   ☐ Request Changes (leave comments)
```

#### How to Approve
```
On GitHub:
1. Click "Review changes" button
2. Select "Approve"
3. Add optional comment: "Looks good! Clean code and tests cover the feature."
4. Click "Submit review"
```

#### After Approval
```
Developer can merge:
1. Click "Merge pull request" button
2. Choose: "Create a merge commit"
3. Confirm merge
4. Delete branch (optional, GitHub will ask)

Result: PR merged to main ✅
```

### **Handling Merge Conflicts**

If PR has merge conflicts:

```bash
# Update your branch with latest main
git fetch origin
git merge origin/main feat/e1-s1-chat-interface

# Resolve conflicts in your editor
# (Look for <<<<<<, ======, >>>>>>>> markers)

# After resolving
git add .
git commit -m "fix: resolve merge conflicts with main"
git push origin feat/e1-s1-chat-interface

# PR will update automatically
```

---

## 🔑 Golden Rules

### ✅ DO:
- ✅ Commit often (every 1-2 hours)
- ✅ Write descriptive commit messages
- ✅ Run tests before pushing
- ✅ Run build before pushing
- ✅ Push regularly (don't let branch get stale)
- ✅ Review code before submitting PR
- ✅ Test manually before PR
- ✅ Keep PRs focused (one story per PR)
- ✅ Update team daily with Slack updates

### ❌ DON'T:
- ❌ Commit code that doesn't build
- ❌ Commit code with failing tests
- ❌ Push console.log debug statements
- ❌ Work on main branch directly
- ❌ Wait until EOD to commit
- ❌ Merge without approvals
- ❌ Make huge commits (1000+ lines)
- ❌ Leave PR open for > 2 days
- ❌ Work on multiple stories in one branch

---

## 📊 Git Command Cheatsheet

### Setup (First Time)
```bash
# Clone repo
git clone <repo-url>
cd all-in-one-chat

# Configure name/email
git config user.name "Your Name"
git config user.email "your.email@company.com"
```

### Daily Commands
```bash
# Check current branch
git branch

# Create feature branch
git checkout -b feat/e1-s1-chat-interface

# See what changed
git status

# Stage changes
git add apps/web/components/chat/ChatInterface.tsx
git add .                    # Add all changes

# Commit
git commit -m "feat: E1.S1 - Add ChatInterface component"

# View commits
git log --oneline -10

# Push to remote
git push origin feat/e1-s1-chat-interface

# Pull latest
git pull origin main
```

### Review & Merge
```bash
# Switch to PR branch
git checkout feat/e1-s1-chat-interface

# Update from main
git merge origin/main

# After PR approved, merge to main
git checkout main
git pull origin main
git merge feat/e1-s1-chat-interface
git push origin main
```

### Undo Mistakes
```bash
# Undo uncommitted changes
git checkout -- apps/web/components/chat/ChatInterface.tsx

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# See all commits (even after reset)
git reflog
```

---

## 🎯 Example: Complete Sprint 1 Day

### 9:00 AM - Kickoff
```bash
# Ensure on main with latest
git checkout main
git pull origin main
```

### 10:30 AM - Start E1.S1
```bash
# Create feature branch
git checkout -b feat/e1-s1-chat-interface

# Create file
# (Edit: apps/web/components/chat/ChatInterface.tsx)

# Commit
git add apps/web/components/chat/ChatInterface.tsx
git commit -m "feat: E1.S1 - Create ChatInterface component skeleton"
```

### 11:30 AM - Add Input Field
```bash
# (Edit: ChatInterface.tsx - add input field)
git add apps/web/components/chat/ChatInterface.tsx
git commit -m "feat: E1.S1 - Add input field with placeholder 'Hỏi gì đó...'"
```

### 12:30 PM - Lunch, Tests Pass
```bash
# Before lunch, run tests
pnpm test
pnpm build
# ✅ All passing!

# Push to remote
git push origin feat/e1-s1-chat-interface
```

### 1:00 PM - After Lunch
```bash
# Check latest main (someone else might have merged)
git fetch origin
git merge origin/main feat/e1-s1-chat-interface
# (No conflicts)
```

### 3:00 PM - Add Styling
```bash
# (Edit: ChatInterface.tsx - add Tailwind CSS)
git add apps/web/components/chat/ChatInterface.tsx
git commit -m "feat: E1.S1 - Style input + button with Tailwind"
git push origin feat/e1-s1-chat-interface
```

### 4:30 PM - Ready for Review
```bash
# Tests + build one final time
pnpm test && pnpm build
# ✅ All good!

# Create PR on GitHub
# - Title: "feat: E1.S1 - Chat Interface UI"
# - Fill template
# - Request reviewer
# - Post to Slack: "PR ready for review"
```

### 5:00 PM - EOD
```bash
# Verify push succeeded
git log origin/feat/e1-s1-chat-interface -5

# Update Slack
"✅ E1.S1 complete - ChatInterface component
 PR: #123 ready for review
 Tests: Passing
 Build: Green"

# Laptop closed, ready for tomorrow!
```

---

## 🚨 Emergency Procedures

### "I committed something wrong"

**If not yet pushed**:
```bash
# See commits
git log --oneline -3

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Re-do it correctly
git add <correct-files>
git commit -m "correct message"
```

**If already pushed**:
```bash
# Revert the commit (creates new commit)
git revert <commit-hash>
git push origin feat/e1-s1-chat-interface
```

### "I'm on wrong branch"

```bash
# See all branches
git branch -a

# Switch to correct branch
git checkout feat/e1-s1-chat-interface

# Or create new from main
git checkout -b feat/e1-s1-chat-interface-v2
```

### "My PR has merge conflicts"

```bash
# On your branch
git fetch origin
git merge origin/main

# Resolve conflicts in editor
# Look for: <<<<<<, ======, >>>>>>

# After resolving:
git add <conflicted-files>
git commit -m "fix: resolve merge conflicts"
git push origin feat/e1-s1-chat-interface
```

### "I need help"

**Slack the team immediately:**
```
"🆘 Git issue - pushed code to wrong branch
 Branch: feat/e1-s1-chat-interface
 Commit: abc1234
 Help?"
```

Team can rollback or fix it together.

---

## 📚 Resources

- Git Guide: https://git-scm.com/docs
- GitHub Flow: https://guides.github.com/introduction/flow/
- Conventional Commits: https://www.conventionalcommits.org/

---

## ✅ Sprint 1 Git Checklist

By end of Sprint 1:

- [ ] 5 feature branches created (one per story)
- [ ] 20+ commits total (4 commits per story average)
- [ ] 5 PRs created & merged
- [ ] All PRs properly reviewed
- [ ] Main branch always green (builds, tests pass)
- [ ] No merge conflicts remaining
- [ ] Team comfortable with git workflow

---

**Git Workflow Version**: 1.0
**Last Updated**: 2025-12-05
**Team**: Frontend Lead, Backend Lead, Full-stack Dev

**Questions? Ask in daily standup! 🚀**
