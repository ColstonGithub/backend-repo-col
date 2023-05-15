exports.notFound = (req, res, next) => {
  try {
    const error = new Error(
      `Not Found !! Please Check Endpoint or Method- ${req.originalUrl}`
    );
    res.status(404).json({ error: error.message });
    //next(error);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.errorHandler = (req, res, next) => {
  try {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
      message: err.message,
      stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
