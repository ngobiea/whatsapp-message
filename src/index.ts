import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
// import CustomError from './utils/CustomError';
import type { Request, Response } from 'express';
// import { statusCode } from './utils/statusCode';
import qrcode from 'qrcode-terminal';
import { Client, RemoteAuth } from 'whatsapp-web.js';
// import { store } from './utils/aws';
import { MongoStore } from 'wwebjs-mongo';
import mongoose from 'mongoose';
const PORT = 5000;
const app = express();

mongoose
  .connect(process.env.DB_URI as string, {
    dbName: process.env.DB_NAME,
  })
  .then(() => {
    console.log('database connected');
    const store = new MongoStore({ mongoose: mongoose });
    const client = new Client({
      authStrategy: new RemoteAuth({
        store,
        backupSyncIntervalMs: 300000,
      }),
      puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    });

    client.on('qr', (qr) => {
      // Generate and scan this code with your phone
      console.log('QR RECEIVED', qr);
      qrcode.generate(qr, { small: true });
    });

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(cors());
    app.use(helmet());

    // app.use(express.static(join(__dirname, '../client/dist/')));
    app.get('/', (_req: Request, res: Response) => {
      res.json({ message: 'Hello World' });
    });
    client.once('ready', () => {
      console.log('Client is ready!');
      app.post('/send-message', async (req: Request, res: Response) => {
        const { number, text, password } = req.body;
        const cleanPhone = number.replace(/\D/g, '');
        console.log(text);
        if (password !== process.env.PASSWORD) {
          return res.status(401).json({ message: 'Invalid password' });
        }
        const chatId = cleanPhone+ '@c.us';
        try {
          const response = await client.sendMessage(chatId, text);
          res.json({ message: 'Message sent successfully', response });
        } catch (error) {
          console.error('Error sending message', error);
          res.status(500).json({ message: 'Error sending message', error });
        }
      });
    });

    // client.on('message', () => {});
    // app.get('*', (_req, res) => res.sendFile(resolve(__dirname, '../client/dist')));
    client.on('remote_session_saved', () => {
      console.log(`remote_session_saved`);
    });
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
    client.initialize();
  })
  .catch((err) => {
    console.log('Error connecting to database');
    console.error(err);
  });
// console.log('DB_URI', process.env.DB_URI);
// const client = new Client({
//   // authStrategy: new RemoteAuth({
//   //   store,
//   //   backupSyncIntervalMs: 300000,
//   // }),
//   // puppeteer: {
//   //   args: ['--no-sandbox', '--disable-setuid-sandbox'],
//   // },
// });
