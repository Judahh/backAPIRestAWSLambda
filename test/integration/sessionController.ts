/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { BaseController } from '../../source';

export default class SessionController extends BaseController {
  protected element = 'sessions';
  protected super = 'session';
  async auth(req, res, fn) {
    if (req.headers.authorization) {
      req.user = req.headers.authorization;
      await fn(true);
    } else {
      const error = new Error('Unauthorized');
      error.name = 'Unauthorized';
      await fn(error);
    }
  }
}
