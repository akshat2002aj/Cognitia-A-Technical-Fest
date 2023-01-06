const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');

const connectDB = require('./config/db');
const errorHandler = require('./middlewares/error');
const cookieParser = require('cookie-parser');

// Route files
const auth = require('./routes/auth');
const event = require('./routes/event');

// Adding Config FIle
dotenv.config({ path: './config/config.env' });

// Connect Database
connectDB();

const app = express();

// Body Parser
app.use(express.json());

// Cookie Parser
app.use(cookieParser());

// Mount routes
app.use('/api/v1/auth', auth);
app.use('/api/v1/event', event);

// Error Handler
app.use(errorHandler);

const server = app.listen(
  process.env.PORT || 5000,
  console.log(`Server Running on PORT ${process.env.PORT}`.yellow.bold)
);

//Handle Unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('Server:\n', err);
  console.log(`Error:${err.message}`.red);
  server.close(() => {
    process.exit(1);
  });
});
