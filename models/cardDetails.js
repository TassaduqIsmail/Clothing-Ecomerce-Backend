const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
  cardHolderName: {
    type: String,
  },
  last4: {
    type: String,
  },
  expMonth: {
    type: Number,
  },
  expYear: {
    type: Number,
  },
  cvcCheck: {
    type: String,
  },
  customerId: {
    type: String,
  },
  brand: {
    type: String,
  },
  paymentMethodId: {
    type: String,
  },
  client_secret: {
    type: String,
  },
  paymentID: {
    type: String,
  },
  cardToken: {
    type: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Card = mongoose.model("Card", cardSchema);

module.exports = Card;
