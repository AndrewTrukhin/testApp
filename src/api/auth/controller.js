import { sign } from '../../services/jwt'
import { success } from '../../services/response/'
import { User, schema } from '../user/index'
import twilio from 'twilio/lib/rest/Twilio';

export const login = ({ user }, res, next) =>
  sign(user.id)
    .then((token) => ({ token, user: user.view(true) }))
    .then(success(res, 201))
    .catch(next)


const accountSid = process.env.TWILIO_ACCOUNT_SID; 
const authToken = process.env.TWILIO_AUTH_TOKEN;  
const serviceID = process.env.TWILIO_SERVICE_SID;
const twilioClient = new twilio(accountSid, authToken);

export const sendSMS = async (phoneNumber) => {
  try {
    console.log('------------request phoneNumber---------\n', phoneNumber)
    const data = await twilioClient
      .verify
      .services(serviceID)
      .verifications
      .create({
        to: `+${phoneNumber}`,
        channel: 'sms'
      })
      console.log('--------data--------\n', data)
    return data
  } catch (error) {
    console.log(`WARNING: ${error}`);
    return { status: 'error', message: 'Error while sending SMS' };
  }
}


export const smsVerification = async (phoneNumber, verificationCode) => {
  try {
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return { message: 'User not found' };
    }
    const verificationResult = await twilioClient
      .verify
      .services(serviceID)
      .verificationChecks.create({
        to: `+${phoneNumber}`,
        code: verificationCode,
      });
        return verificationResult
  } catch (error) {
    console.log(`WARNING: ${error}`);
    return (error?.message || 'Something went wrong')
  }
}
