const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['UPCOMING', 'ACTIVE', 'ENDED'],
      default: 'UPCOMING',
    },
    currentRoundId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Round',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = eventSchema;
