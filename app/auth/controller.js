const User = require('../user/model');
const LoginHistory = require('../login-histories/model');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../config');
const { getToken } = require('../utils/get-token');

async function localStrategy(email, password, done) {
  try {
    let user = await User.findOne({ email }).select('-__v -createdAt -updatedAt -token -loginHistories');

    if (!user) {
      return done();
    }

    if (bcrypt.compareSync(password, user.password)) {
      ({ password, ...userWithoutPassword } = user.toJSON());
      return done(null, userWithoutPassword);
    }
  } catch (err) {
    done(err, null);
  }
  done();
}

async function login(req, res, next) {
  passport.authenticate('local', async function (err, user) {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.json({ error: 1, message: 'email or password incorrect' });
    }

    let signed = jwt.sign(user, config.secretKey);

    const loginHistory = new LoginHistory({ user: user._id, token: signed });
    await loginHistory.save();

    await User.findOneAndUpdate({ _id: user._id }, { $push: { token: signed, loginHistories: loginHistory._id } }, { new: true });

    return res.json({
      message: 'logged in successfully',
      user: user,
      session: loginHistory,
      token: signed,
    });
  })(req, res, next);
}

async function me(req, res, next) {
  if (!req.user) {
    return res.json({
      error: 1,
      message: `Your're not login or token expired`,
    });
  }

  return res.json(req.user);
}

async function logout(req, res, next) {
  let token = getToken(req);
  let user = await User.findOneAndUpdate({ token: { $in: [token] } }, { $pull: { token } }, { useFindAndModify: false });
  let loginHistory = await LoginHistory.findOneAndUpdate({ token: token }, { logoutAt: Date.now() }, { useFindAndModify: false });

  if (!user || !token || !loginHistory) {
    return res.json({
      error: 1,
      message: 'No user found',
    });
  }

  return res.json({
    error: 0,
    message: 'Logout Berhasil',
  });
}

async function register(req, res, next) {
  try {
    const payload = req.body;

    let user = new User(payload);

    await user.save();

    return res.json(user);
  } catch (err) {
    if (err && err.name === 'ValidationError') {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }

    next(err);
  }
}

module.exports = {
  localStrategy,
  login,
  logout,
  me,
  register,
};
