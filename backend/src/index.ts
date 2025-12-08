import express from 'express';
import dotenv from 'dotenv';
import { AppDataSource } from './data-source';
import cors from 'cors';
import routes from './routes';
import path from 'path';
import fileUpload from 'express-fileupload';

dotenv.config();



const app = express();
const port =  process.env.PORT || 3000;

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(fileUpload());

app.use('/', routes)

const assetsRoute = path.resolve(process.env.ASSETS_ROUTE || '');

app.use('/public', express.static(assetsRoute))



AppDataSource.initialize().then(() => {
  console.log('🟢 Base de datos conectada');
  app.listen(port, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
  });
}).catch(console.error);
