const express = require("express");
const router = express.Router();
const eventController = require("../controller/eventsCtrl");

router.get("/getAllEvents", eventController.getAllEvents);
router.post("/create", eventController.createEvent);
router.post("/saveBulkEvents", eventController.saveBulkEvents);
router.get("/getSingleEvent/:id", eventController.getEventById);
router.put("/update/:id", eventController.updateEvent);
router.delete("/delete/:id", eventController.deleteEvent);

module.exports = router;
