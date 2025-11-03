import { Request, Response } from 'express';
import { User } from '../models/user.modal';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already in use' });

    const user = await User.create({ name, email, password });
    // const token = generateToken(user._id.toString());

    res.status(201).json({ user: { id: user._id, name, email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
