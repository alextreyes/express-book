const { validate } = require("jsonschema");
const bookSchema = require("./bookSchema");

function validateBook(req, res, next) {
  const validationResult = validate(req.body, bookSchema);
  if (!validationResult.valid) {
    const errors = validationResult.errors.map((error) => error.stack);
    return res.status(400).json({ errors });
  }
  next();
}

module.exports = validateBook;
