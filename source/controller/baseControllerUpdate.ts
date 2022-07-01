import BaseControllerDefault from './baseControllerDefault';
import { Mixin } from 'ts-mixer';
import { AbstractControllerUpdate, IControllerUpdate } from 'backapi';

export default class BaseControllerUpdate
  extends Mixin(BaseControllerDefault, AbstractControllerUpdate)
  implements IControllerUpdate {}
