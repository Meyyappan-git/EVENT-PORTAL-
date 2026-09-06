const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      minlength: 6,
      maxlength: 6,
    },
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    score: {
      type: Number,
      default: 0,
    },
    lastSubmissionAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = teamSchema;
