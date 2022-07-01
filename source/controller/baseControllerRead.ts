import BaseControllerDefault from './baseControllerDefault';
import { Mixin } from 'ts-mixer';
import { AbstractControllerRead, IControllerRead } from 'backapi';

export default class BaseControllerRead
  extends Mixin(AbstractControllerRead, BaseControllerDefault)
  implements IControllerRead {}
