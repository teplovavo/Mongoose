import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema({
  class_id: Number,
  learner_id: Number,
  scores: Array
}, { collection: 'grades' }); // Указываем имя коллекции

export default mongoose.model('Grade', gradeSchema);
