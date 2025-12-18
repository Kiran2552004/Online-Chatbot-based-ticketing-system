import mongoose from 'mongoose';

const museumSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Museum name is required'],
  },
  slug: {
    type: String,
    unique: true,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  location: {
    type: String,
    default: 'Bengaluru',
  },
  price: {
    type: Number,
    required: [true, 'Ticket price is required'],
    min: 0,
  },
  imageUrl: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Museum = mongoose.model('Museum', museumSchema);

export default Museum;


