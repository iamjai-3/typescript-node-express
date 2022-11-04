import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import Logging from './Logging';

import { IUser } from '../models/UserModel';

const NAMESPACE = 'Auth';

const signJWT = (
  user: IUser,
  callback: (error: Error | null, token: string | null) => void
): void => {
  let timesInEpoch = new Date().getTime();
  let expirationTime =
    timesInEpoch + Number(config.server.token.expireTime) * 100000;
  let expirationTimeInSeconds = Math.floor(expirationTime / 1000);

  Logging.info(
    `[${NAMESPACE}] -- Attempting to sign token for ${user.username}`
  );

  try {
    jwt.sign(
      { username: user.username },
      config.server.token.secret,
      {
        issuer: config.server.token.issuer,
        algorithm: 'HS256',
        expiresIn: expirationTimeInSeconds,
      },
      (error, token) => {
        if (error) {
          callback(error, null);
        } else if (token) {
          callback(null, token);
        }
      }
    );
  } catch (error: any) {
    Logging.error(`[${NAMESPACE}] --  ${error.message} -  Error: ${error}`);
    callback(error, null);
  }
};

export default signJWT;
