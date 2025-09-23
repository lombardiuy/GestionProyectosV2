import path from 'path';
import fs from 'fs/promises';
import fileUpload from 'express-fileupload';

export async function save(
  file: fileUpload.UploadedFile,
  type: string,
  fileName: string
): Promise<string> {
  console.log("⚠️ - POST - file/save");

  const folderMap: Record<string, string> = {
    profilePic: path.join(process.env.ASSETS_ROUTE || '', 'users', 'profilePic'),
    // agrega otros tipos si necesitas
  };

  const folderPath = folderMap[type];
  if (!folderPath) throw new Error('Tipo de archivo no válido');

  await fs.mkdir(folderPath, { recursive: true });

  const ext = path.extname(file.name) || '.jpg';
  const saveName = fileName + ext;
  const savePath = path.join(folderPath, saveName);

  await new Promise<void>((resolve, reject) => {
    file.mv(savePath, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });

  // Retornamos la ruta con separadores estándar
  return savePath.replace(/\\/g, '/');
}

export async function remove(type: string, fileName: string): Promise<void> {
  const folderMap: Record<string, string> = {
    profilePic: path.join(process.env.ASSETS_ROUTE || '', 'users', 'profilePic'),
    // otros tipos si necesitás
  };

  const folderPath = folderMap[type];
  if (!folderPath) throw new Error('Tipo de archivo no válido');

  const possibleExtensions = ['.jpg', '.jpeg', '.png'];
  for (const ext of possibleExtensions) {
    const fullPath = path.join(folderPath, fileName + ext);
    try {
      console.log(fullPath);
      await fs.unlink(fullPath);
      return; // borrado exitoso
    } catch (err: any) {
      if (err.code !== 'ENOENT') throw err; // error real
    }
  }

  throw new Error('Archivo no encontrado para eliminar');
}
