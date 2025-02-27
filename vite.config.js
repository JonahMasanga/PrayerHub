import { defineConfig } from 'vite';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

export default defineConfig({
    root: './public', // Set the root directory to "public"
    server: {
        port: 5173, // Ensure the port matches what you're using
        open: true, // Automatically open the browser
    },
    build: {
        outDir: '../dist', // Output directory for the build
    },
});
