import { Router } from 'express';
import { middleware as query } from 'querymen';
import { middleware as body } from 'bodymen';
import { password as passwordAuth, master, token } from '../../services/passport';
import { index, showMe, show, create, update, updatePassword, destroy } from './controller';
import { schema } from './model';
import { User } from './model';
export User, { schema } from './model';

const router = new Router();
const { email, password, name, picture, role } = schema.tree;


router.get('/',
  token({ required: true, roles: ['admin'] }),
  query(),
  index);


router.get('/me',
  token({ required: true }),
  showMe);


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