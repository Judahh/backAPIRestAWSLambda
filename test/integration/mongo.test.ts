/* eslint-disable @typescript-eslint/no-this-alias */
import DBHandler, { read, write } from './dBHandler';
import TestController from './testController';
import { Test } from './test.class';

let handler;
let controller;
describe('1', () => {
  beforeEach(async () => {
    // console.log('beforeEach');
    handler = DBHandler.getHandler();
    controller = new TestController(DBHandler.getInit());
    // await handler?.getRead()?.clear();
    // await handler?.getWrite()?.clear();
  });

  afterEach(async () => {
    // console.log('afterEach');
    if (handler !== undefined) {
      await handler?.getRead()?.clear();
      await handler?.getWrite()?.clear();
    }
    if (read !== undefined) await read?.close();
    if (write !== undefined) await write?.close();
    handler = undefined;
  });
  test('store test, update, select all, select by id test and delete it', async () => {
    const sentTest = new Test();
    const sentTest2 = new Test();

    const store = await controller.create(
      {
        body: sentTest,
      } as any,
      {}
    );
    console.log('store:', store);
    const storedTest = store;
    // console.log('storedTest:', storedTest);

    sentTest.id = storedTest.body.id;
    const expectedTest = { body: { id: storedTest.body.id } };
    console.log('expectedTest:', expectedTest);
    console.log('storedTest:', storedTest);

    expect(storedTest).toMatchObject(expectedTest);

    const index = await controller.index(
      {
        query: { filter: {} },
      } as any,
      {}
    );
    // console.log('show:', show);
    const indexTest = index;
    expect(indexTest).toMatchObject(expectedTest);

    const store2 = await controller.create(
      {
        body: sentTest2,
      } as any,
      {}
    );
    // console.log('store:', store);
    const storedTest2 = store2;
    // console.log('storedTest2:', storedTest);

    sentTest2.id = storedTest2.body.id;
    const expectedTest2 = { body: { id: storedTest2.body.id } };
    // console.log('expectedTest:', expectedTest);

    expect(storedTest2).toMatchObject(expectedTest2);

    const show = await controller.show(
      {
        query: { filter: {} },
      } as any,
      {}
    );

    const showTest = show;

    const expectedTests = [storedTest.body, storedTest2.body];

    const cleanShowTest = JSON.parse(JSON.stringify(showTest));
    const cleanExpectedTests = JSON.parse(JSON.stringify(expectedTests));
    // console.log('showTest:', cleanShowTest);
    // console.log('expectedTests:', cleanExpectedTests);
    expect(cleanShowTest.body).toEqual(cleanExpectedTests);

    const sentTest3 = { name: 'Test SENT 3' };

    // console.log('storedTest2:', storedTest2);

    const update = await controller.update(
      {
        body: sentTest3,
        query: {
          filter: { id: storedTest2.body.id },
          single: false,
        },
      } as any,
      {}
    );

    // update = await controller.show(
    //   {
    //     query: {
    //       filter: { id: storedTest2.body.id },
    //     },
    //   } as any,
    //   {}
    // );
    // console.log('update:', update);

    const updatedTest = update;
    console.log('sent:', sentTest3);
    console.log('find:', { id: storedTest2.body.id });
    console.log('updatedTest:', updatedTest);
    const expectedUpdatedTest = {
      id: storedTest2.body.id,
      name: sentTest3.name,
    };
    // console.log('expectedUpdatedTest:', expectedUpdatedTest);

    const cleanUpdatedTest = JSON.parse(JSON.stringify(updatedTest.body));
    const cleanExpectedUpdatedTest = JSON.parse(
      JSON.stringify(expectedUpdatedTest)
    );
    console.log('update cleanUpdatedTest:', cleanUpdatedTest);
    console.log('cleanExpectedUpdatedTest:', cleanExpectedUpdatedTest);
    expect(cleanUpdatedTest).toEqual(cleanExpectedUpdatedTest);

    const show2 = await controller.show(
      {
        query: { filter: {} },
      } as any,
      {}
    );

    const showTest2 = show2;

    // console.log('SHOW ALL', showTest2);

    const expectedTests2 = [storedTest.body, expectedUpdatedTest];
    // console.log('showTest2:', showTest2);
    // console.log('expectedTests2:', expectedTests2);

    const cleanShowTest2 = JSON.parse(JSON.stringify(showTest2.body));
    const cleanExpectedTests2 = JSON.parse(JSON.stringify(expectedTests2));
    console.log('cleanShowTest2:', cleanShowTest2);
    console.log('cleanExpectedTests2:', cleanExpectedTests2);
    expect(cleanShowTest2).toEqual(cleanExpectedTests2);

    const deleted = await controller.delete(
      {
        query: {
          filter: { id: storedTest2.body.id },
        },
      } as any,
      {}
    );

    const deletedTest = deleted;
    console.log('deletedTest id:', storedTest2.body.id);
    const expectedDeletedTest = expectedUpdatedTest;
    // console.log('expectedDeletedTest:', expectedDeletedTest);
    const cleanDeletedTest = JSON.parse(JSON.stringify(deletedTest.body));
    const cleanExpectedDeletedTest = JSON.parse(
      JSON.stringify(expectedDeletedTest)
    );
    console.log('cleanDeletedTest:', cleanDeletedTest);
    console.log('cleanExpectedDeletedTest:', cleanExpectedDeletedTest);
    expect(cleanDeletedTest).toEqual(cleanExpectedDeletedTest);

    const show3 = await controller.show(
      {
        query: { filter: {} },
      } as any,
      {}
    );

    const showTest3 = show3.body;
    // console.log('showTest3:', showTest3);
    const expectedTests3 = [storedTest.body];
    const cleanShowTest3 = JSON.parse(JSON.stringify(showTest3));
    const cleanExpectedTests3 = JSON.parse(JSON.stringify(expectedTests3));
    console.log('cleanShowTest3:', cleanShowTest3);
    console.log('cleanExpectedTests3:', cleanExpectedTests3);
    expect(cleanShowTest3).toEqual(cleanExpectedTests3);
  });
});
