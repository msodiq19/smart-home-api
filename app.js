const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const errorHandler = require('./src/middlewares/errorHandler')
const devicesRouter = require('./src/routes/device.routes');
const usersRouter = require('./src/routes/user.routes');
// const schedulesRouter = require('./src/routes/schedule.route');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(errorHandler);

// Routes
app.use('/api/devices', devicesRouter);
app.use('/api/users', usersRouter);
// app.use('/api/schedules', schedulesRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});