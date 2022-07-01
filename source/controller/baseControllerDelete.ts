import BaseControllerDefault from './baseControllerDefault';
import { Mixin } from 'ts-mixer';
import { AbstractControllerDelete, IControllerDelete } from 'backapi';

export default class BaseControllerDelete
  extends Mixin(AbstractControllerDelete, BaseControllerDefault)
  implements IControllerDelete {}
