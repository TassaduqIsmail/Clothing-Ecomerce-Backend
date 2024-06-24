const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  eventDate: {
    type: Date,
    required: true,
  },
  name: {
    type: String,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// eventSchema.pre('save', function(next) {
//   // Check if event date has passed
//   if (this.eventDate < new Date()) {
//     this.completed = true;
//   }
//   next();
// });

const Events = mongoose.model("Events", eventSchema);

module.exports = Events;
