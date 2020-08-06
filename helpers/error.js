const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (error, req, res, next) => {
  // some other routes has an error and we make it here
  console.log("error handler", error);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    error,
    stack: process.env.NODE_ENV === "production" ? "🤢" : error.stack,
  });
};

module.exports = {
  notFound,
  errorHandler,
};
