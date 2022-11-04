import { DataSource } from 'typeorm';
import { config } from '../config/config';

const appDataSource = new DataSource({
  type: 'mongodb',
  url: config.mongo.url,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  synchronize: true,
  logging: true,
  entities: ['src/apollo/entities/*.ts'],
});

export default appDataSource;
