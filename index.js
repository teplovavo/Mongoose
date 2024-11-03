//importing packages
import 'dotenv/config'
import express from 'express';
import mongoose from 'mongoose';

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

// Function to connect to MongoDB
async function connectDB() {
    try {
      await mongoose.connect(process.env.ATLAS_URI);
      console.log('Connected to Mongo!');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      process.exit(1); // Exit process with failure
    }
  };

  // Call function to connect to database
connectDB();

// Middleware for JSON parsing
app.use(express.json());

// Starting the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});