import { defineConfig } from "vite";
import { resolve } from "path";


export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                index: resolve(__dirname, 'index.html'),
                accounts: resolve(__dirname, 'html/accounts.html'),
                archive: resolve(__dirname, 'html/archive.html'),
                calender: resolve(__dirname, 'html/calender.html'),
                faqpage: resolve(__dirname, 'html/faqpage.html'),
                friendslist: resolve(__dirname, 'html/friendslist.html'),
                leaderboard1: resolve(__dirname, 'html/leaderboard1.html'),
                login: resolve(__dirname, 'html/login.html'),
                pet1: resolve(__dirname, 'html/pet1.html'),
                settings: resolve(__dirname, 'html/settings.html'),
                signup: resolve(__dirname, 'html/signup.html'),
                task1: resolve(__dirname, 'html/task1.html'),
                todolist: resolve(__dirname, 'html/todolist.html'),
                catidle1: resolve(__dirname, 'images/catidle1.png'),
                catidle2: resolve(__dirname, 'images/catidle2.png'),
                cathappyidle1: resolve(__dirname, 'images/cathappyidle1.png'),
                cathappyidle2: resolve(__dirname, 'images/cathappyidle2.png'),
                catpetted1: resolve(__dirname, 'images/catpetted1.png'),
                catpetted2: resolve(__dirname, 'images/catpetted2.png'),
                catwant1: resolve(__dirname, 'images/catwant1.png'),
                catwant2: resolve(__dirname, 'images/catwant2.png'),
                cateat1: resolve(__dirname, 'images/cateat1.png'),
                cateat2: resolve(__dirname, 'images/cateat2.png'),
                catplay: resolve(__dirname, 'images/catplay.png'),

            }
        }
    }
});
