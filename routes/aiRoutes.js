const express = require("express");

const {
  generateStudentAiSummary,
  generateClassAiInsights,
} = require("../services/geminiService");

const router = express.Router();

router.get("/students/ai-insights", async (req, res, next) => {
  try {
    const result = await generateClassAiInsights();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/students/:id/ai-summary", async (req, res, next) => {
  try {
    const result = await generateStudentAiSummary(req.params.id);

    if (!result.success) {
      return res.status(404).json({ message: result.message });
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
