# Student Registration System (Separated Files)

Files included:
- `index.html` - main HTML file (links to styles.css and script.js)
- `styles.css` - styling and responsive rules
- `script.js` - JavaScript for add/edit/delete, validation, and LocalStorage
- `README.md` - this file

## Git Commit Instructions (important for assignment)
Make separate commits for each file as required:

```bash
git init
git add index.html
git commit -m "Add index.html - basic structure and form"
git add styles.css
git commit -m "Add styles.css - responsive design and layout"
git add script.js
git commit -m "Add script.js - add/edit/delete and localStorage functionality"
git add README.md
git commit -m "Add README.md - project details and instructions"
# create repo on GitHub and push
git remote add origin <your-github-repo-url>
git branch -M main
git push -u origin main
```

## Notes
- Student ID is locked while editing to avoid accidental duplication.
- Validation enforced on client-side; in production add server-side checks as well.
- Data persists locally in the browser using LocalStorage.
