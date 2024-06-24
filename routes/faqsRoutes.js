const express = require("express");
const {
  createFAQ,
  getFAQs,
  getFAQById,
  updateFAQ,
  deleteFAQ,
} = require("../controller/faqsController");

const router = express.Router();

router.post("/create", createFAQ);
router.get("/", getFAQs);
router.get("/:id", getFAQById);
router.put("/:id", updateFAQ);
router.delete("/:id", deleteFAQ);

module.exports = router;
