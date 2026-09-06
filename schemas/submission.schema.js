const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
      default: false,
    },
    pointsAwarded: {
      type: Number,
      required: true,
      default: 0,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = submissionSchema;
