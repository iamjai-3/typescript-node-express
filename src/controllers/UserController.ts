import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import User from '../models/UserModel';
import Logging from '../library/Logging';
import bcryptjs from 'bcryptjs';
import signJWT from '../library/SignJWT';

const NAMESPACE = 'User';

const validateToken = (req: Request, res: Response, next: NextFunction) => {
  Logging.info(`[${NAMESPACE}] -- Token Validated -> User Authorized`);

  return res.status(200).json({
    message: 'Authorized',
  });
};

const register = (req: Request, res: Response, next: NextFunction) => {
  let { username, password } = req.body;

  bcryptjs.hash(password, 10, (hashError, hash) => {
    if (hashError) {
      return res.status(500).json({
        message: hashError.message,
        error: hashError,
      });
    }

    //? Insert User into DB
    const _user = new User({
      _id: new mongoose.Types.ObjectId(),
      username,
      password: hash,
    });

    return _user
      .save()
      .then((user) => res.status(201).json({ user }))
      .catch((error) => res.status(500).json({ error }));
  });
};

const login = (req: Request, res: Response, next: NextFunction) => {
  let { username, password } = req.body;

  User.find({ username })
    .exec()
    .then((user) => {
      if (user.length !== 1) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      //? Checking password match
      bcryptjs.compare(password, user[0].password, (error, result) => {
        if (error) {
          Logging.error(
            `[${NAMESPACE}] --  ${error.message} -  Error: ${error}`
          );
          return res.status(401).json({ message: 'Unauthorized' });
        } else if (result) {
          signJWT(user[0], (_error, token) => {
            if (_error) {
              Logging.error(
                `[${NAMESPACE}] --- Unable to sign token: -  Error: ${_error}`
              );
              return res
                .status(401)
                .json({ message: 'Unauthorized', error: _error });
            } else if (token) {
              return res
                .status(200)
                .json({ message: 'Auth Successful', token, user: user[0] });
            }
          });
        }
      });
    })
    .catch((error) => {
      return res.status(500).json({ error });
    });
};

const getAllUsers = (req: Request, res: Response, next: NextFunction) => {
  return User.find()
    .select('-password')
    .exec()
    .then((users) => res.status(200).json({ users }))
    .catch((error) => res.status(500).json({ error }));
};

const updateUser = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.userId;

  return User.findById(userId)
    .then((user) => {
      if (user) {
        user.set(req.body);

        return user
          .save()
          .then((user) => res.status(200).json({ user }))
          .catch((error) => res.status(500).json({ error }));
      } else {
        res.status(404).json({ message: 'User Not Found' });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

const deleteUser = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.userId;

  return User.findByIdAndDelete(userId)
    .then((user) =>
      user
        ? res.status(201).json({ message: 'Deleted User' })
        : res.status(404).json({ message: 'User Not Found' })
    )
    .catch((error) => res.status(500).json({ error }));
};

export default {
  register,
  getAllUsers,
  login,
  updateUser,
  deleteUser,
  validateToken,
};
