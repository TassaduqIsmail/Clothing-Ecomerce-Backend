const sendNotification = require("../config/notificationSend");
const Events = require("../models/eventsModel");
const userModel = require("../models/userModel");

exports.createEvent = async (req, res) => {
  const { _id, ...data } = req.body;
  try {
    const newEvent = await Events.create(data);
    const userToken = await userModel.findById(_id);
    if (userToken?.isNotification) {
      const token = userToken?.fcmToken;
      const noti = {
        title: "Event",
        body: "Successfully added event",
      };
      sendNotification(token, noti);
    }
    // console.log(newEvent);
    res.status(201).json(newEvent);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};

exports.getAllEvents = async (req, res) => {
  try {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 14);

    const events = await Events.find({ eventDate: { $gte: futureDate } });
    // console.log(events);
    res.json({ events: events, success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Events.findById(req.params.id);
    event
      ? res.json(event)
      : res.status(404).json({ message: "Event not found" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const updatedEvent = await Events.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    updatedEvent
      ? res.json(updatedEvent)
      : res.status(404).json({ message: "Event not found" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Events.findByIdAndDelete(req.params.id);
    event
      ? res.json({ message: "Event deleted successfully" })
      : res.status(404).json({ message: "Event not found" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.saveBulkEvents = async (req, res) => {
  const events = req.body;
  // console.log("Incoming Events:", events); // Log incoming data

  try {
    const newEvents = [];

    // Iterate over each event in the request
    for (const event of events) {
      // Check if an event with the same title already exists in the database
      const existingEvent = await Events.findOne({ title: event.summary });

      // If no event with the same title exists, add it to the newEvents array
      if (!existingEvent) {
        newEvents.push({
          title: event.summary,
          eventDate: event.start.dateTime,
          name: event.creator.email,
          // additional fields if necessary
        });
      } else {
        console.log(
          `Event with title "${event.summary}" already exists. Skipping...`
        );
      }
    }

    // Insert all new events into the database
    if (newEvents.length > 0) {
      const savedEvents = await Events.insertMany(newEvents);
      res.json({ success: true, events: savedEvents });
    } else {
      console.log("No new events to save");
      res.json({ success: false, message: "No new events to save" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
