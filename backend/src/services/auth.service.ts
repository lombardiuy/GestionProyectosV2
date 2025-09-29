import { AppDataSource } from '../data-source';
import { User } from '../entities/User.entity';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userRepository = AppDataSource.getRepository(User);

export const login = async (username: string, password: string): Promise<string> => {
  const user = await userRepository.findOneBy({ username });

  if (!user) throw new Error('Usuario no encontrado');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Contraseña incorrecta');

  const { password: _, ...userWithoutPassword } = user;

  return jwt.sign(userWithoutPassword, process.env.JWT_SECRET!, {
    expiresIn: '1h',
  });
};

export const getDevToken = async (): Promise<string> => {
  if (process.env.FAKE_AUTH === 'true') {
    const fakeToken = {
      id: 0,
      name: "Usuario prueba",
      username: "testing",
      hasProfilePicture: false,
      userRole: {
        name: 'admin',
      },
      active: true,
    };

    return jwt.sign(fakeToken, process.env.JWT_SECRET!, {
      expiresIn: '1d',
    });
  } else {
    throw new Error('Debe desactivar la autenticación primero!');
  }
};
