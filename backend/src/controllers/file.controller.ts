import { Request, Response } from 'express';
import * as fileService from '../services/file.service';
import type { UploadedFile } from 'express-fileupload';

export const saveFile = async (req: Request, res: Response) => {
  console.log("⚠️ - POST - file/save");

  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'No se recibió archivo' });
    }

    const file = req.files.file as UploadedFile;
    const { type, fileName } = req.body;

    if (!type || !fileName) {
      return res.status(400).json({ error: 'Faltan parámetros type o fileName' });
    }

    const savedPath = await fileService.save(file, type, fileName);

    res.json({ path: savedPath });
  } catch (error: any) {
    console.error('Error al guardar archivo:', error);
    res.status(500).json({ error: error.message || 'Error al guardar archivo' });
  }
};

export const deleteFile = async (req: Request, res: Response) => {
  console.log("⚠️ - DELETE - file/delete");

  const { type, fileName } = req.params;

  try {
    await fileService.remove(type, fileName);
    return res.status(200).json({ message: 'Archivo eliminado correctamente' });
  } catch (error: any) {
    console.error('Error al eliminar archivo:', error);
    return res.status(500).json({ message: 'Error al eliminar el archivo', error: error.message });
  }
};
