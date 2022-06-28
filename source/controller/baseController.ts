/* eslint-disable @typescript-eslint/ban-ts-comment */
import { IController } from 'backapi';
import { Mixin } from 'ts-mixer';
import BaseControllerDelete from './baseControllerDelete';
import BaseControllerStore from './baseControllerCreate';
import BaseControllerUpdate from './baseControllerUpdate';
import BaseControllerRead from './baseControllerRead';
import BaseControllerConnect from './baseControllerConnect';
import BaseControllerHead from './baseControllerHead';
import BaseControllerTrace from './baseControllerTrace';

// @ts-ignore
export default class BaseController
  extends Mixin(
    BaseControllerStore,
    BaseControllerDelete,
    BaseControllerUpdate,
    BaseControllerRead,
    BaseControllerConnect,
    BaseControllerHead,
    BaseControllerTrace
  )
  implements IController {}
