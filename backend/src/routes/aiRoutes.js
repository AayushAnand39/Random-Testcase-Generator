const express = require("express");
const {
    analyze,
    generateGenerator,
    regenerateGenerator
} = require("../controllers/aiController");

const router = express.Router();

router.post("/analyze", analyze);
router.post("/generate-generator", generateGenerator);
router.post("/regenerate-generator", regenerateGenerator);

module.exports = router;