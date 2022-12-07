const mongoose = require('mongoose');
const { model, Schema } = mongoose;

const modelSchema = Schema(
  {
    loginAt: {
      type: Date,
      default: Date.now,
    },
    logoutAt: {
      type: Date,
      default: null,
    },
    token: String,
    // ------- relation dengan Category ----//
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = model('LoginHistory', modelSchema);
