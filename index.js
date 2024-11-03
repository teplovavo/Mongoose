//importing packages
import 'dotenv/config'
import express from 'express';
import mongoose from 'mongoose';

import Grade from './models/Grade.js';


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


/////////////////////////////////test route////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Debug route to fetch sample data from the grades collection
app.get('/grades/debug', async (req, res) => {
    try {
        // Fetch the first 5 documents from the 'grades' collection
        const sampleData = await Grade.find({}).limit(5);
        res.json(sampleData); // Send the data as a JSON response
    } catch (error) {
        console.error('Error fetching sample data:', error);
        res.status(500).json({ error: 'An error occurred while fetching sample data.' });
    }
});



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

