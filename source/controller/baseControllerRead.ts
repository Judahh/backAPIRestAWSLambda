import BaseControllerDefault from './baseControllerDefault';
import { Mixin } from 'ts-mixer';
import { AbstractControllerRead, IControllerRead } from 'backapi';

export default class BaseControllerRead
  extends Mixin(BaseControllerDefault, AbstractControllerRead)
  implements IControllerRead {}
