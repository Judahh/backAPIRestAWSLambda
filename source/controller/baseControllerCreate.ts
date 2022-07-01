import BaseControllerDefault from './baseControllerDefault';
import { Mixin } from 'ts-mixer';
import { AbstractControllerCreate, IControllerCreate } from 'backapi';

export default class BaseControllerCreate
  extends Mixin(AbstractControllerCreate, BaseControllerDefault)
  implements IControllerCreate {}
