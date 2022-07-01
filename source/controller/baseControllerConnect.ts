import BaseControllerDefault from './baseControllerDefault';
import { Mixin } from 'ts-mixer';
import { AbstractControllerConnect, IControllerConnect } from 'backapi';

export default class BaseControllerConnect
  extends Mixin(AbstractControllerConnect, BaseControllerDefault)
  implements IControllerConnect {}
