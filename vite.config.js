import { defineConfig } from 'vite';
   import dotenv from 'dotenv';

   dotenv.config(); // Load environment variables from .env file

   export default defineConfig({
       define: {
           'process.env': {
               FIREBASE_DATABASE_URL: JSON.stringify(process.env.FIREBASE_DATABASE_URL),
               FIREBASE_PROJECT_ID: JSON.stringify(process.env.FIREBASE_PROJECT_ID)
           }
       }
   });
