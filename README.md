# Swiftask


## Overview
Our team BBY19 is designing an app called Swiftask, which is designed to motivate students by using techniques that match their interests from friendly competitions and to-do lists to progress tracking and more.

Developed for the COMP 1800 course, this project applies User-Centred Design practices and agile project management, and demonstrates integration with Firebase backend services for storing user favorites.

---


## Features

- Create, edit and complete tasks
- Compete with friends on the leaderboard
- Play with, feed and pet your cat 
- View your tasks on a calendar
- View friends, points, level and user ID in profile
- Responsive design for desktop and mobile

---


## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Backend**: Firebase for hosting
- **Database**: Firestore

---


## Usage

1. Open your browser and visit `https://nineteen1800.web.app/`.
2. Browse the list of tasks in the main page.
3. Click the plus button at the bottom of the screen to add a task.
4. Click the edit button to change details about your task.
5. Click the done button to move your task to archive.
6. Click the leaderboard button on the bottom right to view your status on the leaderboard.
7. Click the button on the bottom middle to view your pet.
8. Click the store button near the top on the left to buy food/toys for your pet.
9. Click the bag button below the store button to use the food/toys purchased.
10. Click the three buttons below the pet to interact with it.
11. View upcoming deadlines in the calendar.
12. View profile details in profile page.

---


## Project Structure

```
Swiftask/
├── .firebase/
├── .vscode/
│
├── css/
│   ├── faqpage.css
│   └── style.css
│
├── html/
│   ├── accounts.html
│   ├── archive.html
│   ├── calender.html
│   ├── faqpage.html
│   ├── friendslist.html
│   ├── leaderboard1.html
│   ├── login.html
│   ├── pet1.html
│   ├── settings.html
│   ├── signup.html
│   ├── skeleton.html
│   ├── task1.html
│   └── todolist.html
│
├── images/
│   ├── add.png
│   ├── archive.png
│   ├── back.png
│   ├── background.png
│   ├── bagicon.png
│   ├── ball.png
│   ├── calendar.png
│   ├── cateat1.png
│   ├── cateat2.png
│   ├── cathappyidle1.png
│   ├── cathappyidle2.png
│   ├── catidle1.png
│   ├── catidle2.png
│   ├── catpetted1.png
│   ├── catpetted2.png
│   ├── catplay.png
│   ├── catwant1.png
│   ├── catwant2.png
│   ├── chevron.png
│   ├── cookedmeat.png
│   ├── currency.png
│   ├── emptybowl.png
│   ├── fire.png
│   ├── fish.png
│   ├── foodbowl.png
│   ├── fullenergy.png
│   ├── fullheart.png
│   ├── half-circle.png
│   ├── half-circle2.png
│   ├── half-circle2old.png
│   ├── hunger2.png
│   ├── Icon.ico
│   ├── information.png
│   ├── leaderboard.png
│   ├── left-chevron.png
│   ├── lock.png
│   ├── meat.png
│   ├── milkbowl.png
│   ├── pet.png
│   ├── plainbg.png
│   ├── plainbg2.png
│   ├── position-ranking-board-icon-of-leaderboard-vector.jpg
│   ├── setting.png
│   ├── shopicon.png
│   ├── stuffy.png
│   ├── task.png
│   └── user.png
│
├── js/
│   ├── accounts.js
│   ├── archive.js
│   ├── auth.js
│   ├── calender.js
│   ├── firebaseConfig.js
│   ├── friendslist.js
│   ├── indexTasks.js
│   ├── leaderboard.js
│   ├── loginSignup.js
│   ├── pet.js
│   ├── setting.js
│   ├── task.js
│   └── todolist.js
│
├── node_modules/
│
├── points_server/
│
├── public/
│
├── src/
│
├── styles/
│   ├── archive.css
│   ├── calender.css
│   ├── friendslist.css
│   ├── leaderboard.css
│   ├── login.css
│   ├── settings.css
│   ├── signup.css
│   └── style.css
│
├── .env
├── .firebaserc
├── .gitignore
├── firebase.json
├── firestore.indexes.json
├── firestore.rulkes
├── index.html
├── package-lock.json
├── package.json
├── README.md
├── vite.config.js
```

---


## Contributors
- India Murgatroyd- BCIT CST Student who loves being in nature, for a variety of sports and activities. Fun fact: I am a middle child of 3 girls.
- Jeevan Singh Jandu - BCIT CST Student with a passion for playing and wanting to create videogames. Fun fact: I am the youngest of 3 and my siblings are both sisters.
- Jemsel Aaron Jumapit - BCIT CST Student who loves to stay at home, procrastinate, and code. Fun fact: I have 5 brothers whose names all start with a J.
---


## Acknowledgments

- Used ChatGPT for code suggestions, debugging purposes and explanations.
- Icons sourced from [Flaticon]([https://fontawesome.com/](https://www.flaticon.com/icons))).

---


## Limitations and Future Work
### Limitations

- Leaderboard doesn't have a podium.
- Settings does not have many options for customization.

### Future Work

- Implement different pets.
- Make a friends leaderboard as well as the universal leaderboard.
- Group todo list 

---


## License

This project is licensed under the MIT License. See the LICENSE file for details.
