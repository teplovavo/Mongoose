// Importing packages and Grade model
import 'dotenv/config';
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
}

// Call function to connect to database
connectDB();

// Middleware for JSON parsing
app.use(express.json());

// Starting the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Basic route to verify server is running
app.get('/', (req, res) => {
    res.send('Server is up and running!');
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// GET route at '/grades/stats' to get overall statistics
app.get('/grades/stats', async (req, res) => {
    try {
        // Aggregation pipeline to get overall statistics
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

        res.json(stats); // Send the stats as JSON response
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'An error occurred while fetching stats.' });
    }
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// GET route at '/grades/stats/:id' to get stats for a specific class
app.get('/grades/stats/:id', async (req, res) => {
    try {
        const classId = parseInt(req.params.id); // Get class_id from URL and convert it to a number

        // Aggregation pipeline to get statistics for the specific class
        const classStats = await Grade.aggregate([
            { $match: { class_id: classId } }, // Filter documents by specified class_id
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

        res.json(classStats); // Send class stats as JSON response
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ error: 'An error occurred while fetching class stats.' });
    }
});
