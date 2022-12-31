const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');

// Adding Config FIle
dotenv.config({ path: './config/config.env' });

const app = express();

app.use(express.json());

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
