const advancedResults = (model, populate) => async (req, res, next) => {
  let query;

  // Copy Req.query
  const reqQuery = { ...req.query };

  // Field to exclude
  const removeField = ['select', 'sort'];

  //Loop over removeField and delete them from reqQuery
  removeField.forEach((param) => delete reqQuery[param]);

  // query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators like gt gte etc
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  // Finding Resource
  query = model.find(JSON.parse(queryStr));

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort fields
  if (req.query.sort) {
    const sortBy = rq.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  if (populate) {
    query = query.populate(populate);
  }

  // Executing Query
  const results = await query;

  res.advancedResults = {
    success: true,
    count: results.length,
    data: results,
  };

  next();
};

module.exports = advancedResults;
