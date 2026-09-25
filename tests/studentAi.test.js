const test = require('node:test');
const assert = require('node:assert/strict');

const {
  calculateStudentAverage,
  buildStudentPerformanceSummary,
  calculateClassInsights,
} = require('../services/geminiService');

test('calculateStudentAverage returns the correct average score', () => {
  const student = {
    marks: {
      javascript: 90,
      python: 95,
      java: 88,
      DSA: 92,
    },
  };

  assert.equal(calculateStudentAverage(student), 91.25);
});

test('buildStudentPerformanceSummary returns a helpful academic summary', () => {
  const summary = buildStudentPerformanceSummary({
    name: 'Alice',
    course: 'BSc Computer Science',
    marks: {
      javascript: 90,
      python: 95,
      java: 88,
      DSA: 92,
    },
  });

  assert.match(summary, /Alice/i);
  assert.match(summary, /91\.25|91.25/i);
  assert.match(summary, /strong|excellent|outstanding/i);
});

test('calculateClassInsights summarizes class performance correctly', () => {
  const students = [
    {
      name: 'Alice',
      marks: { javascript: 90, python: 95, java: 88, DSA: 92 },
    },
    {
      name: 'Bob',
      marks: { javascript: 70, python: 68, java: 72, DSA: 75 },
    },
  ];

  const insights = calculateClassInsights(students);

  assert.equal(insights.classAverage, 81.25);
  assert.equal(insights.topPerformer, 'Alice');
});
