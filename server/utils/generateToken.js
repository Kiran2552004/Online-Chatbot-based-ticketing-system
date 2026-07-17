import jwt from 'jsonwebtoken';

export const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is missing');
    throw new Error('JWT_SECRET is missing');
  }

  if (!id) {
    throw new Error('User ID is required to generate token');
  }

  return jwt.sign(
    { id: id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};