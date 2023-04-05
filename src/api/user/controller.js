import { User, schema } from '.';
import { sign } from '../../services/jwt';


export const index = async ({ querymen: { query, select, cursor } }, res) => {
  try {
    const usersCount = await User.count(query);
    const users = await User.find(query, select, cursor);
    const rows = users.map((user) => user.view());
    const data = { rows, usersCount };
    return res.status(200).json(data);
  } catch (error) {
    console.log(`Error when connecting ${error}`);
    return res.status(500).json({ Error: 'Server error' });
  }
}


export const show = async ({ params }, res) => {
  try {
    const user = await User.findById(params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json(user.view());
  } catch (error) {
    console.log(`Error ${error} when reading user`);
    return res.status(500).json({ Error: 'Server error' });
  }
}


export const showMe = ({ user }, res) =>
  res.json(user.view(true));


export const create = async ({ bodymen: { body } }, res, next) => {
  try {
    const user = await User.create(body);
    const token = await sign(user.id);
    const result = { token, user: user.view(true) };
    return res.status(201).json(result);
  } catch (error) {
    /* istanbul ignore else */
    if (error.name === 'MongoError' && error.code === 11000) {
      res.status(409).json({
        valid: false,
        param: 'email',
        message: 'email already registered'
      });
    } else {
      next(error);
      console.log(`Error ${error} when creating user`);
      return res.status(500).json({ Error: 'Server error' });
    }
  }
}


export const update = async ({ bodymen: { body }, params, user }, res) => {
  try {
    const result = await User.findById(params.id === 'me' ? user.id : params.id);
    const isAdmin = user.role === 'admin';
    const isSelfUpdate = user.id === result.id;
    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!isSelfUpdate && !isAdmin) {
      return res.status(401).json({
        valid: false,
        message: 'You can\'t change other user\'s data'
      })
    }
    const updatedUser = await Object.assign(user, body).save();
    return res.status(200).json(updatedUser.view(true));
  } catch (error) {
    console.log(`Error ${error} when updatind user`);
    return res.status(500).json({ Error: 'Server error' });
  }
}


export const destroy = async ({ params }, res) => {
  try {
    const user = await User.findById(params.id);
    if(!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await user.remove();
    return res.status(200).json({ message: 'User removed succesfully' });
  } catch (error) {
    return res.status(500).json(`WARNING: ${error}`);
  }
}