import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { config } from './config/config';
import Logging from './library/Logging';
import authorRoutes from './routes/Author.routes';
import bookRoutes from './routes/Book.routes';
import userRoutes from './routes/User.routes';

const router = express();

/** Connect to Mongo */
mongoose
  .connect(config.mongo.url, { retryWrites: true, w: 'majority' })
  .then(() => {
    Logging.info('<- Mongo Connected ->');
    StartServer();
  })
  .catch((error) => {
    Logging.error('Error on Connecting Mongo : ->');
    Logging.error(error);
  });

/** Only start the server of mongo connects */
const StartServer = () => {
  router.use((req: Request, res: Response, next: NextFunction) => {
    /** Log the Request */
    Logging.info(
      `Incoming --> Method : [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}]`
    );

    res.on('finish', () => {
      /** Log the Response */
      Logging.info(
        `Outgoing --> Method : [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}] - Status: [${res.statusCode}]`
      );
    });

    next();
  });

  router.use(express.urlencoded({ extended: true }));
  router.use(express.json());

  /** Rules of our API */
  router.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );

    if (req.method == 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'PUT,POST,PATCH,DELETE,GET');
      return res.status(200).json({});
    }

    next();
  });

  /** Routes */
  router.use('/authors', authorRoutes);
  router.use('/books', bookRoutes);
  router.use('/users', userRoutes);

  /** Health check */
  router.get('/ping', (req: Request, res: Response, next: NextFunction) =>
    res.status(200).json({ message: 'Testing!!!' })
  );

  /** Error Handling */
  router.use((req: Request, res: Response, next: NextFunction) => {
    const error = new Error('<--Not Found-->');
    Logging.error(error);

    return res.status(404).json({ message: error });
  });

  http
    .createServer(router)
    .listen(config.server.port, () =>
      Logging.info(`<-- Server is running on PORT: ${config.server.port} -->`)
    );
};
