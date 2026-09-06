const mongoose = require('mongoose');

const roundSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['LOCKED', 'OPEN', 'CLOSED'],
      default: 'LOCKED',
    },
    questionIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      default: [],
    }],
  },
  { timestamps: true }
);

module.exports = roundSchema;
