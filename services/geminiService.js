const Student = require('../models/Student');

function calculateStudentAverage(student) {
  if (!student || !student.marks) {
    return 0;
  }

  const subjectMarks = Object.values(student.marks);
  const validMarks = subjectMarks.filter((mark) => typeof mark === 'number' && !Number.isNaN(mark));

  if (!validMarks.length) {
    return 0;
  }

  const total = validMarks.reduce((sum, mark) => sum + mark, 0);
  return Number((total / validMarks.length).toFixed(2));
}

function buildStudentPerformanceSummary(student) {
  if (!student) {
    return 'No student data available for analysis.';
  }

  const average = calculateStudentAverage(student);
  const highestSubject = Object.entries(student.marks || {}).sort(([, a], [, b]) => b - a)[0];
  const strongestSubject = highestSubject ? highestSubject[0] : 'N/A';
  const highestScore = highestSubject ? highestSubject[1] : 0;

  let outlook = 'needs improvement';
  if (average >= 85) outlook = 'excellent';
  else if (average >= 70) outlook = 'strong';
  else if (average >= 55) outlook = 'average';

  return `${student.name || 'Student'} (${student.course || 'Unknown course'}) has an average score of ${average}. Overall performance is ${outlook}. The strongest subject is ${strongestSubject} with ${highestScore}. This indicates a solid academic foundation and room for continued growth.`;
}

function calculateClassInsights(students) {
  if (!students || !students.length) {
    return {
      classAverage: 0,
      topPerformer: 'N/A',
      strongestSubject: 'N/A',
      totalStudents: 0,
    };
  }

  const subjectNames = ['javascript', 'python', 'java', 'DSA'];
  const studentAverages = students.map((student) => ({
    name: student.name,
    average: calculateStudentAverage(student),
  }));

  const classAverage = Number(
    (
      studentAverages.reduce((sum, student) => sum + student.average, 0) / studentAverages.length
    ).toFixed(2)
  );

  const topPerformer = studentAverages.reduce((top, current) => {
    if (!top || current.average > top.average) return current;
    return top;
  }, null);

  const subjectAverages = subjectNames.map((subject) => {
    const total = students.reduce((sum, student) => sum + (student.marks?.[subject] || 0), 0);
    return {
      subject,
      average: Number(((total / students.length) || 0).toFixed(2)),
    };
  });

  const strongestSubject = subjectAverages.reduce((top, current) => {
    if (!top || current.average > top.average) return current;
    return top;
  }, null);

  return {
    classAverage,
    topPerformer: topPerformer ? topPerformer.name : 'N/A',
    strongestSubject: strongestSubject ? strongestSubject.subject : 'N/A',
    totalStudents: students.length,
  };
}

async function generateGeminiText(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (error) {
    console.error('Gemini generation failed:', error.message);
    return null;
  }
}

async function generateStudentAiSummary(studentId) {
  const student = await Student.findById(studentId);

  if (!student) {
    return {
      success: false,
      message: 'Student not found',
    };
  }

  const localSummary = buildStudentPerformanceSummary(student);
  const prompt = `Act as a smart academic advisor. Provide a concise but insightful summary for this student. Student details: name=${student.name}, course=${student.course}, age=${student.age}, email=${student.email}, marks=${JSON.stringify(student.marks)}. Give a motivational academic summary with strengths, weak areas, and next steps.`;

  const aiSummary = await generateGeminiText(prompt);

  return {
    success: true,
    student: {
      id: student._id,
      name: student.name,
      course: student.course,
      average: calculateStudentAverage(student),
    },
    summary: aiSummary || localSummary,
    fallbackUsed: !aiSummary,
  };
}

async function generateClassAiInsights() {
  const students = await Student.find();
  const insights = calculateClassInsights(students);

  const prompt = `Act as a university academic analyst. Provide a brief class performance overview using these results: ${JSON.stringify(
    students.map((student) => ({
      name: student.name,
      course: student.course,
      marks: student.marks,
    }))
  )}. Mention top performer, strongest subject, trends, and intervention advice.`;

  const aiSummary = await generateGeminiText(prompt);

  return {
    success: true,
    insights,
    summary: aiSummary || `Class average is ${insights.classAverage}. Top performer is ${insights.topPerformer}. Strongest subject is ${insights.strongestSubject}.`,
    fallbackUsed: !aiSummary,
  };
}

module.exports = {
  calculateStudentAverage,
  buildStudentPerformanceSummary,
  calculateClassInsights,
  generateStudentAiSummary,
  generateClassAiInsights,
  generateGeminiText,
};
