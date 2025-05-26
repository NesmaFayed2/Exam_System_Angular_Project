const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const status = err.statusText || "error";
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({ status, message });
};

module.exports = errorHandler;
