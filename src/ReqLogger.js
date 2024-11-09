const logRequest = (req, res, next) => {
  console.log('');
  console.log(`${req.method} ${req.originalUrl}`);

  const originalSend = res.send;
  res.send = (data) => {
    console.log(`${res.statusCode} | ${data}`);
    return originalSend.call(res, data);
  };
  next();
}

module.exports = logRequest
