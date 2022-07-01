import BaseControllerDefault from './baseControllerDefault';
import { Mixin } from 'ts-mixer';
import { AbstractControllerTrace, IControllerTrace } from 'backapi';

export default class BaseControllerTrace
  extends Mixin(BaseControllerDefault, AbstractControllerTrace)
  implements IControllerTrace {}
