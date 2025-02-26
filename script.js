import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
   import { getDatabase, ref, set, push } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";
   import dotenv from 'dotenv';

   // Load environment variables
   dotenv.config();

   const firebaseConfig = {
       databaseURL: process.env.FIREBASE_DATABASE_URL,
       projectId: process.env.FIREBASE_PROJECT_ID
   };

   const app = initializeApp(firebaseConfig);
   const db = getDatabase(app);

   // Rest of your code...
