import { BaseControllerDefault as AbstractControllerDefault } from 'backapirest';
import { Operation } from 'flexiblepersistence';

export default class BaseControllerDefault extends AbstractControllerDefault {
  protected restFramework = 'aws';

  protected emit(
    _requestOrData?,
    responseOrSocket?,
    _headers?,
    _operation?: Operation,
    status?,
    object?
  ): Promise<void> {
    const cache: any[] = [];
    const cleanObject = JSON.parse(
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

    responseOrSocket = {
      statusCode: status,
      body: cleanObject,
    };

    return responseOrSocket;
  }
}
