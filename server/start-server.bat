@echo off
set MONGODB_URI=mongodb+srv://eshani:eshanipaul009@cluster0.j0hvfzi.mongodb.net/calorie-tracker
set PORT=3001
set FRONTEND_URL=http://localhost:8081
set NODE_ENV=development

echo Starting MongoDB server...
echo MongoDB URI: %MONGODB_URI%
echo Port: %PORT%
echo Frontend URL: %FRONTEND_URL%

node server.js
