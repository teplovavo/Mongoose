import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';

import Grade from './models/Grade.js';

const app = express();
const PORT = process.env.PORT || 3000;

async function connectDB() {
    try {
        await mongoose.connect(process.env.ATLAS_URI);
        console.log('Connected to Mongo!');
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    }
}

connectDB();

app.use(express.json());

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
    res.send('Server is up and running!');
});



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Route to get overall stats for grades
app.get('/grades/stats', async (req, res) => {
  try {
      const stats = await Grade.aggregate([
          { $unwind: "$scores" },
          {
              $group: {
                  _id: "$_id",
                  averageScore: { $avg: "$scores.score" }
              }
          },
          {
              $group: {
                  _id: null,
                  avgAbove50: { $sum: { $cond: [{ $gt: ["$averageScore", 50] }, 1, 0] } },
                  totalLearners: { $sum: 1 }
              }
          },
          {
              $project: {
                  _id: 0,
                  avgAbove50: 1,
                  totalLearners: 1,
                  percentageAbove50: { $multiply: [{ $divide: ["$avgAbove50", "$totalLearners"] }, 100] }
              }
          }
      ]);

      res.json(stats);
  } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'An error occurred while fetching stats.' });
  }
});


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GET route at '/grades/stats/:id' to get stats for a specific class
app.get('/grades/stats/:id', async (req, res) => {
  try {
      const classId = parseInt(req.params.id); // Parse class_id from the URL
      console.log(`Filtering for class_id: ${classId}`); // Debug log for classId

      // Use aggregation to filter by class_id and calculate statistics
      const classStats = await Grade.aggregate([
          { $match: { class_id: classId } }, // Apply class_id filter
          { $unwind: '$scores' }, // Unwind the 'scores' array
          {
              $group: {
                  _id: '$_id', // Group by student ID
                  averageScore: { $avg: '$scores.score' } // Calculate average score per student
              }
          },
          {
              $group: {
                  _id: null, // Overall stats for the class
                  avgAbove50: { $sum: { $cond: [{ $gt: ['$averageScore', 50] }, 1, 0] } },
                  totalLearners: { $sum: 1 }
              }
          },
          {
              $project: {
                  _id: 0,
                  avgAbove50: 1,
                  totalLearners: 1,
                  percentageAbove50: { $multiply: [{ $divide: ['$avgAbove50', '$totalLearners'] }, 100] }
              }
          }
      ]);

      console.log(`Class ${classId} stats:`, classStats); // Debug log for results
      res.json(classStats); // Send filtered stats as JSON response
  } catch (error) {
      console.error('Error occurred:', error);
      res.status(500).json({ error: 'An error occurred while fetching class stats.' });
  }
});
