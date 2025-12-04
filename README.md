# Swiftask


## Overview
Elmo Hikes is a client-side JavaScript web application that helps users discover and explore hiking trails. The app displays a curated list of hike trails, each with details such as name, location, difficulty, and an image. Users can browse the list and mark their favorite trails for easy access later.

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

Example:
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
elmo-hikes/
├── css/
│   └── faqpage.css
│   ├── style.css
├── html/
│   └── accounts.html
│   ├── archive.html
│   ├── calendar.html
│   ├── faqpage.html
│   ├── friendlist.html
│   ├── leaderboard.html
│   ├── login.html
│   ├── pet1.html
│   ├── settings.html
│   ├── signup.html
│   ├── skeleton.html
│   ├── task1.html
│   ├── todolist.html
├── images/
│   └── petsprites/
│   ├──add.png
│   ├── archive.png
│   ├──back.png
│   ├──background.png
│   ├──calendar.png
│   ├──chevron.png
│   ├──fire.png
│   ├──half-circle.png
│   ├──halfcircle2.png
│   ├──Icon.ico
│   ├──information.png
│   ├──leaderboard.png
│   ├──left-chevron.png
│   ├──lock.png
│   ├──pet.png
│   ├──plainbg.png
│   ├──position-ranking-board-icon-of-leaderboard-vector.png
│   ├──setting.png
│   ├──task.png
│   ├──user.png
├── js/
│   └──accounts.js
│   ├──archive.js
│   ├──auth.js
│   ├──calendar.js
│   ├──firebaseConfig.js
│   ├──friendslist.js
│   ├──indexTasks.js
│   ├──leaderboard.js
│   ├──loginSignup.js
│   ├──main.js
│   ├──pet.js
│   ├──setting.js
│   ├──task.js
│   ├──todolist.js
├── index.html
├── package.json
├── README.md
```

---


## Contributors
- India Murgatroyd- BCIT CST Student who loves being in nature, for a variety of sports and activities. Fun fact: I am a middle child of 3 girls.
- Jeevan Singh Jandu - BCIT CST Student with a passion for playing and wanting to create videogames. Fun fact: I am the youngest of 3 and my siblings are both sisters.
- Jemsel Aaron Jumapit - BCIT CST Student who loves to stay at home, procrastinate, and code. Fun fact: I have 5 brothers whose names all start with a J.
---


## Acknowledgments

- Trail data and images are for demonstration purposes only.
- 
- Icons sourced from [FontAwesome](https://fontawesome.com/) and images from [Unsplash](https://unsplash.com/).

---


## Limitations and Future Work
### Limitations

- Limited trail details (e.g., no live trail conditions).
- Settings does not have many options for customization.

### Future Work

- Implement different pets.
- Make a friends leaderboard as well as the universal leaderboard.

---


## License

This project is licensed under the MIT License. See the LICENSE file for details.
