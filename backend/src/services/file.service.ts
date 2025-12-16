import path from 'path';
import fs from 'fs/promises';
import fileUpload from 'express-fileupload';

export async function save(
  file: fileUpload.UploadedFile,
  type: string,
  fileName: string
): Promise<string> {
  console.log("⚠️ - POST - file/save");


  //Esta matriz protege los direcotorios de guardado
  const folderMap: Record<string, string> = {
    userProfilePic: path.join(process.env.ASSETS_ROUTE || '', 'users'),
    factoryProfilePic: path.join(process.env.ASSETS_ROUTE || '', 'factories'),
    
  };

  const folderPath = folderMap[type];
  if (!folderPath) throw new Error('Tipo de archivo no válido');

  await fs.mkdir(folderPath, { recursive: true });

  let ext = path.extname(file.name) || '.jpeg';

  if (type === 'userProfilePic' || type === 'factoryProfilePic') {
    ext = '.jpeg'
  }
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
  
      await fs.unlink(fullPath);
      return; // borrado exitoso
    } catch (err: any) {
      if (err.code !== 'ENOENT') throw err; // error real
    }
  }

  throw new Error('Archivo no encontrado para eliminar');
}


export async function createEmptyDir(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(process.env.ASSETS_ROUTE + dirPath, { recursive: true });
    console.log(`Directorio creado: ${dirPath}`);
  } catch (err) {
    console.error(`Error al crear directorio: ${dirPath}`, err);
    throw err;
  }
}