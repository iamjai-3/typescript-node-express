import 'reflect-metadata';
import express, { Request, Response, NextFunction, Express } from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { config } from './config/config';
import Logging from './library/Logging';
import authorRoutes from './routes/Author.routes';
import bookRoutes from './routes/Book.routes';
import userRoutes from './routes/User.routes';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { TaskResolver } from './apollo/resolvers/Task.resolver';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import appDataSource from './apollo/AppDataSource';

const app: Express = express();

//TODO: Update all models to GraphQL TypeORM model and commit in graphql-test branch

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

/** Only start the server of Mongo connects */

const StartServer = async () => {
  /** Initializing Mongo TypeORM */
  appDataSource
    .initialize()
    .then(() => {
      Logging.info('<--Mongo TypeORM Initialized-->');
    })
    .catch((err) => {
      Logging.error(`<--Error Initializing Mongo TypeORM--> :${err}`);
    });

  /** Apollo Server Configurations */
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [TaskResolver],
      validate: false,
    }),
    introspection: true,
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  app.use((req: Request, res: Response, next: NextFunction) => {
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

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  /** Rules of our API */
  app.use((req: Request, res: Response, next: NextFunction) => {
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
  app.use('/authors', authorRoutes);
  app.use('/books', bookRoutes);
  app.use('/users', userRoutes);

  /** Health check */
  app.get('/ping', (req: Request, res: Response, next: NextFunction) =>
    res.status(200).json({ message: 'Testing!!!' })
  );

  /** Error Handling */
  app.use((req: Request, res: Response, next: NextFunction) => {
    const error = new Error('<--Not Found-->');
    Logging.error(error);

    return res.status(404).json({ message: error });
  });

  http
    .createServer(app)
    .listen(config.server.port, () =>
      Logging.info(`<-- Server is running on PORT: ${config.server.port} -->`)
    );
};
