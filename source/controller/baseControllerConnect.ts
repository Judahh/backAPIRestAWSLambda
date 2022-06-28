import BaseControllerDefault from './baseControllerDefault';
import { Mixin } from 'ts-mixer';
import { AbstractControllerConnect, IControllerConnect } from 'backapi';

export default class BaseControllerConnect
  extends Mixin(BaseControllerDefault, AbstractControllerConnect)
  implements IControllerConnect {}
