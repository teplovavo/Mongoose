// models/Grade.js
import mongoose from 'mongoose';

// Define the schema for the grades collection
const gradeSchema = new mongoose.Schema({
    class_id: {
        type: Number,
        required: true,
        min: 0,
        max: 300
    },
    learner_id: {
        type: Number,
        required: true,
        min: 0
    },
    scores: [{
        type: {
            type: String,
            enum: ['exam', 'quiz', 'homework'],
            required: true
        },
        score: {
            type: Number,
            min: 0,
            max: 100,
            required: true
        }
    }]
});

// Create a Mongoose model using the schema
const Grade = mongoose.model('Grade', gradeSchema);

export default Grade;
