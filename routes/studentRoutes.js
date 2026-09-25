const express = require("express");

const Student = require("../models/Student");
const {
  calculateStudentAverage,
  buildStudentPerformanceSummary,
} = require("../services/geminiService");

const router = express.Router();

router.post("/students", async (req, res, next) => {
  try {
    const student = new Student(req.body);
    const savedStudent = await student.save();

    res.status(201).json({
      message: "Student created successfully",
      student: savedStudent,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/students", async (req, res, next) => {
  try {
    const students = await Student.find();

    res.status(200).json({
      count: students.length,
      students,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/students/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({
      student,
      averageMarks: calculateStudentAverage(student),
      performanceSummary: buildStudentPerformanceSummary(student),
    });
  } catch (error) {
    next(error);
  }
});

router.put("/students/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const updatedStudent = await Student.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({
      message: "Student updated successfully",
      student: updatedStudent,
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/students/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const deletedStudent = await Student.findByIdAndDelete(id);

    if (!deletedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({
      message: "Student deleted successfully",
      student: deletedStudent,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;