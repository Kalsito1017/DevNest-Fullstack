Backend → .NET DevNest on 44320 → serves JSON API

Frontend → React devnestui on 5173 → fetches API data

CORS or Vite proxy ensures cross-origin requests work

Frontend displays data in React components (Header, Body, Footer, Pages)

Add SQL Server for data storage

cd DevNest-FullStack
git submodule add https://github.com/YourUsername/devnestui.git frontend
git commit -m "Add frontend as submodule"
git push -u origin main
