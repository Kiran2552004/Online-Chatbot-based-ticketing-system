import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Museum from '../models/Museum.js';

// Load .env properly (seed file is inside utils/)
dotenv.config({ path: "./.env" });

// Debug log
console.log("Loaded MONGO_URI =", process.env.MONGO_URI);

const museums = [
  {
    name: 'Visvesvaraya Industrial & Technological Museum',
    slug: 'visvesvaraya-industrial-technological-museum',
    description: 'Explore the wonders of science and technology at this iconic museum named after Sir M. Visvesvaraya.',
    location: 'Bengaluru',
    price: 100,
    imageUrl: '',
    isActive: true,
  },
  {
    name: 'HAL Heritage & Aerospace Museum',
    slug: 'hal-heritage-aerospace-museum',
    description: 'Discover the rich heritage of Hindustan Aeronautics Limited and India\'s aerospace achievements.',
    location: 'Bengaluru',
    price: 150,
    imageUrl: '',
    isActive: true,
  },
  {
    name: 'NIMHANS Brain Museum',
    slug: 'nimhans-brain-museum',
    description: 'A unique museum showcasing the human brain and neuroscience research.',
    location: 'Bengaluru',
    price: 50,
    imageUrl: '',
    isActive: true,
  },
  {
    name: 'Kempegowda Museum',
    slug: 'kempegowda-museum',
    description: 'Learn about the founder of Bangalore, Kempegowda, and the city\'s history.',
    location: 'Bengaluru',
    price: 75,
    imageUrl: '',
    isActive: true,
  },
  {
    name: 'Indian Music Experience Museum',
    slug: 'indian-music-experience-museum',
    description: 'Experience the rich musical heritage of India through interactive exhibits and displays.',
    location: 'Bengaluru',
    price: 200,
    imageUrl: '',
    isActive: true,
  },
  {
    name: 'Government Museum Bengaluru',
    slug: 'government-museum-bengaluru',
    description: 'One of the oldest museums in India, housing archaeological and geological collections.',
    location: 'Bengaluru',
    price: 30,
    imageUrl: '',
    isActive: true,
  },
];

const seedMuseums = async () => {
  try {
    await connectDB();

    for (const museum of museums) {
      const exists = await Museum.findOne({ slug: museum.slug });
      if (!exists) {
        await Museum.create(museum);
        console.log(`Created museum: ${museum.name}`);
      } else {
        console.log(`Museum already exists: ${museum.name}`);
      }
    }

    console.log("Museum seeding completed!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding museums:", err);
    process.exit(1);
  }
};

seedMuseums();
