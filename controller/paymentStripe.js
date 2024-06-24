const Card = require("../models/cardDetails");
const dotenv = require("dotenv").config();
const asyncHandler = require("express-async-handler");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const validateMongoDbId = require("../utils/validateMongodbId");
const sendVerificationEmail = require("./emailCtrl");
const User = require("../models/userModel");
const sendNotification = require("../config/notificationSend");
const userModel = require("../models/userModel");

const SavePaymentDetails = asyncHandler(async (req, res) => {
  const { _id } = req.params;
  const { email, holderName, paymentMethodId, cardDetails } = req.body;
  validateMongoDbId(_id);

  try {
    // Check if the user already exists and has a customerId and paymentMethodId
    let user = await Card.findOne({ userId: _id });

    let customerId;

    if (user && user.customerId && user.paymentMethodId) {
      // User exists, so update the existing payment method
      customerId = user.customerId;
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Update the existing card details in MongoDB
      user.last4 = cardDetails.last4;
      user.expMonth = cardDetails.expiryMonth;
      user.expYear = cardDetails.expiryYear;
      user.cvcCheck = cardDetails.validCVC;
      user.brand = cardDetails.brand;
      user.cardHolderName = holderName;
      user.paymentMethodId = paymentMethodId;
      await user.save();
    } else {
      // User does not exist or does not have a customerId, so create a new customer and attach the payment method
      const customer = await stripe.customers.create({ email });
      customerId = customer.id;
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Create a new card entry in MongoDB
      user = await Card.create({
        last4: cardDetails.last4,
        expMonth: cardDetails.expiryMonth,
        expYear: cardDetails.expiryYear,
        cvcCheck: cardDetails.validCVC,
        brand: cardDetails.brand,
        userId: _id,
        cardHolderName: holderName,
        customerId: customerId,
        paymentMethodId: paymentMethodId,
      });
    }

    res.send({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(400).send({ error: error.message });
  }
});

const order = asyncHandler(async (req, res) => {
  const { _id } = req.params;
  const { price } = req.body;
  console.log(_id);
  validateMongoDbId(_id);
  try {
    const userCard = await Card.findOne({ userId: _id });
    const userToken = await userModel.findById(_id);

    if (!userCard) return res.status(404).send("User or card not found");

    const paymentIntent = await stripe.paymentIntents.create({
      // amount: price * 100 || 2000,
      amount: 2000,
      currency: "usd",
      customer: userCard.customerId,
      payment_method: userCard.paymentMethodId,
      off_session: true,
      confirm: true,
    });

    console.log(paymentIntent.client_secret);
    // const charge = await stripe.charges.create({
    //   amount: 3999,
    //   currency: "usd",
    //   source: user.cardToken,
    //   description: "Order payment",
    // });

    let success = false;
    let message = "Payment failed or is incomplete";
    if (paymentIntent.status === "succeeded") {
      success = true;
      message = "Payment was successful";

      if (userToken?.isNotification) {
        const token = userToken?.fcmToken;
        const noti = {
          title: "Ordered",
          body: "Successfully Order",
        };
        sendNotification(token, noti);
      }
    } else {
      success = false;
      message = "Payment failed or is incomplete";
      console.log(message);
    }

    userCard.client_secret = paymentIntent.client_secret;
    await userCard.save();
    res.send({
      success: success,
      message: message,
      clientSecret: paymentIntent.client_secret,
      paymentMethodId: userCard.paymentMethodId,
    });
  } catch (error) {
    // Handle errors
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
const paymentSave = asyncHandler(async (req, res) => {
  const { _id } = req.params;
  const { email, paymentMethodId } = req.body;
  validateMongoDbId(_id);
  try {
    const user = await Card.findOne({ userId: _id });
    const userToken = await userModel.findById(_id);

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }
    // const paymentMethod = await stripe.paymentMethods.create({
    //   type: "card",
    //   card: {
    //     number: cardDetails.number,
    //     exp_month: cardDetails.exp_month,
    //     exp_year: cardDetails.exp_year,
    //     cvc: cardDetails.cvc,
    //   },
    //   billing_details: {
    //     name: cardDetails.name,
    //   },
    // });

    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: user.customerId,
    });

    user.paymentMethodId.push(paymentMethod);
    await user.save();

    if (userToken?.isNotification) {
      const token = userToken?.fcmToken;
      const noti = {
        title: "Card",
        body: "Successfully card added",
      };
      sendNotification(token, noti);
    }

    res.send(paymentMethod);
  } catch (error) {
    // Handle errors
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

async function sendInvoiceToUser(email, message) {
  try {
    const subject = "Your order confirm and will delivered you soon...";
    // sendVerificationEmail(email, message, subject);
  } catch (error) {
    console.error("Error sending invoice:", error);
  }
}

module.exports = { SavePaymentDetails, order, paymentSave };
