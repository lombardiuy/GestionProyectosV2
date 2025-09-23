import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

export const login = async (req: Request, res: Response) => {
  console.log("⚠️ POST - auth/login");
  const { username, password } = req.body;
  try {
    const token = await authService.login(username, password);
    res.json({ token });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
};

export const getDevToken = async (req: Request, res: Response) => {
  console.log("⚠️ GET - auth/getDevToken");
  try {
    const token = await authService.getDevToken();
    res.json({ token });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
