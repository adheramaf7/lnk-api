const User = require('./model');

async function index(req, res, next) {
  try {
    const users = await User.find().select('-__v -createdAt -updatedAt -token -password').populate('loginHistories');
    return res.json({ data: users });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  index,
};
