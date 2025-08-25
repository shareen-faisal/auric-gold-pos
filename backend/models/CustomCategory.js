const mongoose = require('mongoose');

const customCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    lowercase: true,   
    trim: true         
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

customCategorySchema.index({ name: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('CustomCategory', customCategorySchema);
// const mongoose = require('mongoose');

// const customCategorySchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true
//   },
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// module.exports = mongoose.model('CustomCategory', customCategorySchema);
