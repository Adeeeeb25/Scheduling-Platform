// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  // Database errors
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'Duplicate entry. This record already exists.' });
  }

  // Validation errors
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ error: 'Invalid foreign key reference.' });
  }

  // MySQL connection errors
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    return res.status(503).json({ error: 'Database connection lost.' });
  }

  if (err.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR') {
    return res.status(503).json({ error: 'Database error encountered.' });
  }

  if (err.code === 'PROTOCOL_ENQUEUE_AFTER_DESTROY') {
    return res.status(503).json({ error: 'Database connection destroyed.' });
  }

  // Default error
  const statusCode = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({ error: message });
};

module.exports = errorHandler;
