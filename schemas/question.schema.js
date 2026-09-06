const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    roundId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Round',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['MCQ', 'RIDDLE'],
      required: true,
    },
    options: [{
      type: String,
      trim: true,
    }],
    correctAnswer: {
      type: String,
      required: true,
      trim: true,
    },
    points: {
      type: Number,
      required: true,
      default: 1,
    },
    order: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  { timestamps: true }
);

module.exports = questionSchema;
