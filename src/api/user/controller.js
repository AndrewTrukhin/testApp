import { User, schema } from '.';
import { sign } from '../../services/jwt';
import { sendSMS, smsVerification } from '../auth/controller';


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


export const create = async (req, res) => {
  try {
    const user = await User.create(req.body);
    const userPhoneNumber = req.body.phoneNumber;
    const sendSMSResult = await sendSMS(userPhoneNumber);
    return res.status(201).json({
      user: user.view(true),
      status: sendSMSResult.status,
      message: 'Verification code was sent succesfully'
    });
  } catch (error) {
    /* istanbul ignore else */
    console.log('---------------SAME USER---------------\n', error)
    console.log('KeyValue------\n', error.keyValue)
    if (error.name === 'MongoError' && error.code === 11000) { 
      const uniqueProperties = Object.keys(error.keyValue);
      const duplicatedValue = uniqueProperties[0];
      if (duplicatedValue) { 
        res.status(409).json({
          valid: false,
          param: duplicatedValue,
          message: `${duplicatedValue} already registered`
        });
      }
    } else {
      console.log(`Error ${error} when creating user`);
      return res.status(500).json({ Error: 'Server error' });
    }
  }
}

export const resendSMS = async (req, res) => {
  try {
    const userPhoneNumber = req.body.phoneNumber;
    const user = await User.findOne({ phoneNumber: userPhoneNumber });
    if (!user) {
      return res.status(404).json({ message: 'Such a phonenumber not found' });
    }
    if (user.isVerified) {
      return res.status(422).json({ message: 'You already have an account. Please login to proceed' });
    }

    const sendSMSResult = await sendSMS(userPhoneNumber);
    return res.status(200).json({
      status: sendSMSResult.status,
      message: 'SMS was resend succesfully',
    });
  } catch (error) {
    console.log(`WARNING: ${error}`);
    return res.status(500).json({ Error: 'Server error' });
  }
}


export const verifyUser = async (req, res) => {
  try {
    const userPhoneNumber = req.body.phoneNumber;
    const verificationCode = req.body.verificationCode;
    const user = await User.findOne({ phoneNumber: userPhoneNumber }).select('_id name');
    const result = await smsVerification(userPhoneNumber, verificationCode);
    if (result.status !== 'approved') {
      return res.status(400).json({ message: 'Invalid verification code' });
    }
    user.isVerified = true;
    await user.save();
    return res.status(200).json({
      user: user,
      status: result.status,
      message: 'Verification succesful',
    });
  } catch (error) {
    console.log(`WARNING: ${error}`);
    return res.status(500).json({ Error: 'Server error' });
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
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await user.remove();
    return res.status(200).json({ message: 'User removed succesfully' });
  } catch (error) {
    return res.status(500).json(`WARNING: ${error}`);
  }
}