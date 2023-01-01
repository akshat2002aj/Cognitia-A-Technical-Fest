const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');

const connectDB = require('./config/db');
const errorHandler = require('./middlewares/error');

// Route files
const auth = require('./routes/auth');

// Adding Config FIle
dotenv.config({ path: './config/config.env' });

// Connect Database
connectDB();

const app = express();

app.use(express.json());

// Mount routes
app.use('/api', auth);

// Error Handler
app.use(errorHandler);

const server = app.listen(
  process.env.PORT || 5000,
  console.log(`Server Running on PORT ${process.env.PORT}`.yellow.bold)
);

//Handle Unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error:${err.message}`.red);
  server.close(() => {
    process.exit(1);
  });
});
