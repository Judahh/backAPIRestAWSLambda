import { BaseControllerDefault as AbstractControllerDefault } from 'backapirest';
import { Operation } from 'flexiblepersistence';

export default class BaseControllerDefault extends AbstractControllerDefault {
  protected restFramework = 'aws';

  protected clearCircularObject(object) {
    const cache: any[] = [];
    return JSON.parse(
      JSON.stringify(object, (_key, value) => {
        if (typeof value === 'object' && value !== null) {
          // Duplicate reference found, discard key
          if (cache.includes(value)) return;
          // Store value in our collection
          cache.push(value);
        }
        return value;
      })
    );
  }

  protected emit(
    _requestOrData?,
    responseOrSocket?,
    headers?,
    _operation?: Operation,
    status?,
    object?
  ): Promise<void> {
    const cleanBody = this.clearCircularObject(object);
    const cleanHeaders = this.clearCircularObject(headers);

    responseOrSocket.statusCode = status;
    responseOrSocket.body = cleanBody;
    responseOrSocket.headers = cleanHeaders;
    return responseOrSocket;
  }
}
