import { Router } from 'express';
import { middleware as query } from 'querymen';
import { middleware as body } from 'bodymen';
import { master, token } from '../../services/passport';
import { index, showMe, show, create, update, destroy, verifyUser, /*signIn,*/ resendSMS } from './controller';
import { schema } from './model';
import { User } from './model';
export User, { schema } from './model';

const router = new Router();
const { email, password, name, phoneNumber, picture, role } = schema.tree;


router.get('/',
  token({ required: true, roles: ['admin'] }),
  query(),
  index);


router.get('/me',
  token({ required: true }),
  showMe);

router.post('/create',
  body({ email, password, name, phoneNumber, picture, role }),
  create);

router.post('/resendSMS',
  body({ phoneNumber }),
  resendSMS);

router.post('/verify',
  body({ phoneNumber }),
  verifyUser);

//router.post('/login', signIn);


router.get('/:id',
  show);


router.post('/',
  //master(),
  body({ email, password, name, picture, role }),
  create);


router.put('/:id',
  token({ required: true }),
  body({ name, picture }),
  update);


router.delete('/:id',
  token({ required: true, roles: ['admin'] }),
  destroy);

export default router;