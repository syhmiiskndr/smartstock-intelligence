# SmartStock Intelligence: Git workflow, one branch per source file

This guide shows how to put the prototype source code into GitHub with one branch for each part
(setup, sidebar, and every page). Each branch becomes a pull request that a groupmate reviews.

## 0. Before you start (once)

1. Your repository is already cloned and open in VS Code. Open the terminal in VS Code
   (Terminal, then New Terminal). Use Git Bash on Windows, or any terminal on macOS and Linux.
2. Unzip `smartstock-web.zip` into a folder **outside** the repository, for example `~/Downloads/smartstock-web`.
   This folder is only a source of files. Do not open it as the repository.
3. In the terminal, point a variable to that folder (change the path to yours):

```bash
SRC=~/Downloads/smartstock-web
```

   The variable only lasts while this terminal is open. If you open a new terminal, type it again.
   In PowerShell use `Copy-Item` instead of `cp`, or drag the files into the VS Code Explorer.
4. Check you are in the repository folder and that it is clean. `main` must already have at least one commit
   (for example the README from the earlier repository guide):

```bash
git status
```

5. On GitHub: Settings, then Branches (or Rules), and add a rule for `main` that requires a pull request
   before merging. After this nobody can push straight to `main` by mistake.

## 1. The loop you repeat for every branch

1. Go to `main` and get the latest code from GitHub.
2. Create a new branch with a clear name.
3. Copy only the files that belong to this branch into the repository.
4. Check with `git status`, add those files by name, and commit.
5. Push the branch and open a pull request on GitHub.
6. A groupmate reviews it and presses **Merge**. Then you go back to step 1 for the next branch.

Branch names: `chore/...` for setup work, `feature/...` for something new that users see.
Commit messages start with `feat:` (new feature), `fix:` (bug fix) or `chore:` (setup).

Open the pull request from the link that `git push` prints, or on GitHub press **Compare and pull request**.
If you use the GitHub CLI you can run `gh pr create --fill`.

After your pull request is merged:

```bash
git switch main
git pull
git branch -d <branch-name>
```

## 2. Order of the branches

Merge them in this order. The sidebar must be merged before any page that uses it. The pages after that can be
done by different people in any order, because each page is a separate file and no page edits a shared file.

| # | Branch | What it adds |
|---|---|---|
| 1 | `chore/project-setup` | Project setup (merge this first) |
| 2 | `feature/sidebar` | Sidebar (needed by every app page) |
| 3 | `feature/landing-page` | Landing page |
| 4 | `feature/login-page` | Login |
| 5 | `feature/dashboard-page` | Dashboard |
| 6 | `feature/products-page` | Products |
| 7 | `feature/product-detail-page` | Product detail |
| 8 | `feature/stock-page` | Stock in and out |
| 9 | `feature/adjustments-page` | Adjustments |
| 10 | `feature/alerts-page` | Alerts |
| 11 | `feature/inspect-page` | Inspect |
| 12 | `feature/history-page` | Inspection history |
| 13 | `feature/reports-page` | Reports |
| 14 | `feature/users-page` | Users |
| 15 | `feature/settings-page` | Settings |

## 3. Exact commands for each branch

Run the block for one branch at a time. Wait for its pull request to be merged before the next one
(the sidebar and setup branches must be merged first).

### 1. `chore/project-setup`

```bash
git switch main
git pull
git switch -c chore/project-setup
mkdir -p src src/lib
cp "$SRC/src/main.jsx" "$SRC/src/App.jsx" "$SRC/src/index.css" src/
cp "$SRC/src/lib/DCLogic.jsx" src/lib/
cp "$SRC/README.md" "$SRC/GIT_WORKFLOW.md" "$SRC/.gitignore" "$SRC/.env.example" "$SRC/package.json" "$SRC/package-lock.json" "$SRC/vite.config.js" "$SRC/index.html" .
git status
git add README.md GIT_WORKFLOW.md .gitignore .env.example package.json package-lock.json vite.config.js index.html src/main.jsx src/App.jsx src/index.css src/lib/DCLogic.jsx
git commit -m "chore: set up React, Vite and automatic page routing"
git push -u origin chore/project-setup
```

### 2. `feature/sidebar`

```bash
git switch main
git pull
git switch -c feature/sidebar
mkdir -p src/components
cp "$SRC/src/components/Sidebar.jsx" src/components/
git status
git add src/components/Sidebar.jsx
git commit -m "feat: add shared sidebar navigation"
git push -u origin feature/sidebar
```

### 3. `feature/landing-page`

```bash
git switch main
git pull
git switch -c feature/landing-page
mkdir -p src/pages
cp "$SRC/src/pages/Home.jsx" "$SRC/src/pages/Home.css" src/pages/
git status
git add src/pages/Home.jsx src/pages/Home.css
git commit -m "feat: add landing page with interactive freshness demo"
git push -u origin feature/landing-page
```

### 4. `feature/login-page`

```bash
git switch main
git pull
git switch -c feature/login-page
mkdir -p src/pages
cp "$SRC/src/pages/Login.jsx" "$SRC/src/pages/Login.css" src/pages/
git status
git add src/pages/Login.jsx src/pages/Login.css
git commit -m "feat: add login page"
git push -u origin feature/login-page
```

### 5. `feature/dashboard-page`

```bash
git switch main
git pull
git switch -c feature/dashboard-page
mkdir -p src/pages
cp "$SRC/src/pages/Dashboard.jsx" "$SRC/src/pages/Dashboard.css" src/pages/
git status
git add src/pages/Dashboard.jsx src/pages/Dashboard.css
git commit -m "feat: add dashboard page"
git push -u origin feature/dashboard-page
```

### 6. `feature/products-page`

```bash
git switch main
git pull
git switch -c feature/products-page
mkdir -p src/pages
cp "$SRC/src/pages/Products.jsx" "$SRC/src/pages/Products.css" src/pages/
git status
git add src/pages/Products.jsx src/pages/Products.css
git commit -m "feat: add products list page"
git push -u origin feature/products-page
```

### 7. `feature/product-detail-page`

```bash
git switch main
git pull
git switch -c feature/product-detail-page
mkdir -p src/pages
cp "$SRC/src/pages/ProductDetail.jsx" "$SRC/src/pages/ProductDetail.css" src/pages/
git status
git add src/pages/ProductDetail.jsx src/pages/ProductDetail.css
git commit -m "feat: add product detail page"
git push -u origin feature/product-detail-page
```

### 8. `feature/stock-page`

```bash
git switch main
git pull
git switch -c feature/stock-page
mkdir -p src/pages
cp "$SRC/src/pages/Stock.jsx" "$SRC/src/pages/Stock.css" src/pages/
git status
git add src/pages/Stock.jsx src/pages/Stock.css
git commit -m "feat: add stock in and out page"
git push -u origin feature/stock-page
```

### 9. `feature/adjustments-page`

```bash
git switch main
git pull
git switch -c feature/adjustments-page
mkdir -p src/pages
cp "$SRC/src/pages/Adjustments.jsx" "$SRC/src/pages/Adjustments.css" src/pages/
git status
git add src/pages/Adjustments.jsx src/pages/Adjustments.css
git commit -m "feat: add adjustments page"
git push -u origin feature/adjustments-page
```

### 10. `feature/alerts-page`

```bash
git switch main
git pull
git switch -c feature/alerts-page
mkdir -p src/pages
cp "$SRC/src/pages/Alerts.jsx" "$SRC/src/pages/Alerts.css" src/pages/
git status
git add src/pages/Alerts.jsx src/pages/Alerts.css
git commit -m "feat: add alerts page"
git push -u origin feature/alerts-page
```

### 11. `feature/inspect-page`

```bash
git switch main
git pull
git switch -c feature/inspect-page
mkdir -p src/pages
cp "$SRC/src/pages/Inspect.jsx" "$SRC/src/pages/Inspect.css" src/pages/
git status
git add src/pages/Inspect.jsx src/pages/Inspect.css
git commit -m "feat: add AI freshness inspection page"
git push -u origin feature/inspect-page
```

### 12. `feature/history-page`

```bash
git switch main
git pull
git switch -c feature/history-page
mkdir -p src/pages
cp "$SRC/src/pages/History.jsx" "$SRC/src/pages/History.css" src/pages/
git status
git add src/pages/History.jsx src/pages/History.css
git commit -m "feat: add inspection history page"
git push -u origin feature/history-page
```

### 13. `feature/reports-page`

```bash
git switch main
git pull
git switch -c feature/reports-page
mkdir -p src/pages
cp "$SRC/src/pages/Reports.jsx" "$SRC/src/pages/Reports.css" src/pages/
git status
git add src/pages/Reports.jsx src/pages/Reports.css
git commit -m "feat: add reports page"
git push -u origin feature/reports-page
```

### 14. `feature/users-page`

```bash
git switch main
git pull
git switch -c feature/users-page
mkdir -p src/pages
cp "$SRC/src/pages/Users.jsx" "$SRC/src/pages/Users.css" src/pages/
git status
git add src/pages/Users.jsx src/pages/Users.css
git commit -m "feat: add users page"
git push -u origin feature/users-page
```

### 15. `feature/settings-page`

```bash
git switch main
git pull
git switch -c feature/settings-page
mkdir -p src/pages
cp "$SRC/src/pages/Settings.jsx" "$SRC/src/pages/Settings.css" src/pages/
git status
git add src/pages/Settings.jsx src/pages/Settings.css
git commit -m "feat: add settings page"
git push -u origin feature/settings-page
```

## 4. Run the project

After setup and the pages are merged and you are on an up-to-date `main`:

```bash
npm install
npm run dev
```

Open the address that the terminal prints (normally http://localhost:5173). To check that the production build works, run `npm run build`.
Do not commit the `node_modules` or `dist` folders. The `.gitignore` already skips them.

## 5. Common mistakes and fixes

| Problem | Fix |
|---|---|
| `git status` shows files from another branch | Do not add them. Add only the files named in your block. |
| You added a wrong file | `git restore --staged <file>` removes it from the commit. |
| You committed on `main` by mistake and have not pushed | `git switch -c feature/new-name` keeps the commit on a new branch, then on `main` run `git reset --hard origin/main`. |
| `git push` is rejected | Run `git pull` on that branch first, then push again. |
| Merge conflict | Open the file in VS Code, choose which lines to keep, save, then `git add <file>` and `git commit`. Ask a groupmate if unsure. |
| The page shows "Page not found" | The branch for that page is not merged yet, or you are not on an up-to-date `main`. |
| Unsure whether a secret is in a file | Never commit `.env`. Only `.env.example` goes in Git, and it must stay empty of real values. |

## 6. Security rules for this repository

- Keep the Supabase **service_role** key out of this project completely. The web app may only hold the project URL and the anon key.
- Put your own keys in a local `.env` file. It is ignored by Git.
- If a secret is ever pushed by mistake, tell the team at once and rotate the key in Supabase. Deleting the commit later does not remove it from history.
