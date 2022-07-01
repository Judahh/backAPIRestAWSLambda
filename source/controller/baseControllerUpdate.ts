import BaseControllerDefault from './baseControllerDefault';
import { Mixin } from 'ts-mixer';
import { AbstractControllerUpdate, IControllerUpdate } from 'backapi';

export default class BaseControllerUpdate
  extends Mixin(AbstractControllerUpdate, BaseControllerDefault)
  implements IControllerUpdate {}
