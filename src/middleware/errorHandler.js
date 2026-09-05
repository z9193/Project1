class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const payload = {
    error: status === 500 ? "Error interno del servidor" : err.message,
  };

  if (err.details) {
    payload.details = err.details;
  }

  if (status === 500) {
    console.error(err);
  }

  res.status(status).json(payload);
}

function notFound(_req, res) {
  res.status(404).json({ error: "Ruta no encontrada" });
}

module.exports = { HttpError, errorHandler, notFound };
