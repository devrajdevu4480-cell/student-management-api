const errorHandler = (error, req, res, next) => {

    console.error(error);

    // Invalid MongoDB ObjectId
    if (error.name === "CastError") {
        return res.status(400).json({
            message: "Invalid student ID"
        });
    }

    // Mongoose validation error
    if (error.name === "ValidationError") {
        return res.status(400).json({
            message: "Validation failed",
            error: error.message
        });
    }

    // Duplicate email
    if (error.code === 11000) {
        return res.status(400).json({
            message: "Email already exists"
        });
    }

    // Default error
    res.status(500).json({
        message: "Something went wrong"
    });
};

module.exports = errorHandler;