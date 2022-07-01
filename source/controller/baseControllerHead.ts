import BaseControllerDefault from './baseControllerDefault';
import { Mixin } from 'ts-mixer';
import { AbstractControllerHead, IControllerHead } from 'backapi';

export default class BaseControllerHead
  extends Mixin(AbstractControllerHead, BaseControllerDefault)
  implements IControllerHead {}
