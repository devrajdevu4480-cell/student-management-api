const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    age: {
        type: Number,
        required: true
    },

    course: {
        type: String,
        required: true
    },

    marks: {
        javascript: {
            type: Number,
            required: true
        },

        python: {
            type: Number,
            required: true
        },

        java: {
            type: Number,
            required: true
        },

        DSA: {
            type: Number,
            required: true
        }
    }

});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;