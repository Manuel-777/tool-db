jest.mock("../getCrypto.ts");
import elliptic from "elliptic";
import Automerge from "automerge";

import { textRandom, ToolDb } from "..";
import leveldb from "../utils/leveldb";

jest.setTimeout(20000);

let nodeA: ToolDb | undefined;
let nodeB: ToolDb | undefined;
let Alice: ToolDb | undefined;
let Bob: ToolDb | undefined;

beforeAll((done) => {
  (global as any).ecp256 = new elliptic.ec("p256");

  nodeA = new ToolDb({
    server: true,
    host: "127.0.0.1",
    port: 9000,
    storageName: "test-node-a",
    storageAdapter: leveldb,
  });
  nodeA.onConnect = () => checkIfOk(nodeA.options.peerAccount.address);

  nodeB = new ToolDb({
    server: true,
    // Node A is going to be our "bootstrap" node
    peers: [{ host: "localhost", port: 9000 }],
    host: "127.0.0.1",
    port: 8000,
    storageName: "test-node-b",
    storageAdapter: leveldb,
  });
  nodeB.onConnect = () => checkIfOk(nodeB.options.peerAccount.address);

  Alice = new ToolDb({
    server: false,
    peers: [{ host: "localhost", port: 9000 }],
    storageName: "test-alice",
    storageAdapter: leveldb,
  });
  Alice.anonSignIn();
  Alice.onConnect = () => checkIfOk(Alice.options.peerAccount.address);

  Bob = new ToolDb({
    server: false,
    peers: [{ host: "localhost", port: 8000 }],
    storageName: "test-bob",
    storageAdapter: leveldb,
  });
  Bob.anonSignIn();
  Bob.onConnect = () => checkIfOk(Bob.options.peerAccount.address);

  const connected = [];
  const checkIfOk = (id: string) => {
    if (!connected.includes(id)) {
      connected.push(id);

      if (connected.length === 3) {
        let signedIn = false;
        while (!signedIn) {
          if (Alice.getPubKey() && Bob.getPubKey()) {
            signedIn = true;
          }
        }
        done();
      }
    }
  };
});

afterAll((done) => {
  nodeA.network.server.close();
  nodeB.network.server.close();

  setTimeout(done, 1000);
});

it("A and B are signed in", () => {
  expect(Alice.getPubKey()).toBeDefined();
  expect(Bob.getPubKey()).toBeDefined();
});

it("A can put and get", () => {
  return new Promise<void>((resolve) => {
    const testKey = "test-key-" + textRandom(16);
    const testValue = "Cool value";

    Alice.putData(testKey, testValue).then((msg) => {
      expect(msg).toBeDefined();
      setTimeout(() => {
        Alice.getData(testKey).then((data) => {
          expect(data).toBe(testValue);
          resolve();
        });
      }, 1000);
    });
  });
});

it("A and B can communicate trough the swarm", () => {
  return new Promise<void>((resolve) => {
    const testKey = "test-key-" + textRandom(16);
    const testValue = "Awesome value";

    Alice.putData(testKey, testValue).then((msg) => {
      expect(msg).toBeDefined();

      setTimeout(() => {
        Bob.getData(testKey).then((data) => {
          expect(data).toBe(testValue);
          resolve();
        });
      }, 1500);
    });
  });
});

it("A can sign up and B can sign in", () => {
  return new Promise<void>((resolve) => {
    const testUsername = "test-username-" + textRandom(16);
    const testPassword = "im a password";

    Alice.signUp(testUsername, testPassword).then((result) => {
      expect(result).toBeDefined();
      setTimeout(() => {
        Bob.signIn(testUsername, testPassword).then((res) => {
          expect(res).toBeDefined();
          expect(Bob.getPubKey()).toBeDefined();
          expect(Bob.getUsername()).toBe(testUsername);

          // test for failed sign in
          setTimeout(() => {
            Bob.signIn(testUsername, testPassword + " ").catch((e) => {
              expect(e).toBe("Invalid password");
              resolve();
            });
          }, 1000);
        });
      }, 1000);
    });
  });
});

it("Can cancel GET timeout", () => {
  return new Promise<void>((resolve) => {
    const testKey = "crdt-get-test-" + textRandom(16);
    const testValue = textRandom(24);

    Alice.putData(testKey, testValue).then(() => {
      Alice.getData(testKey, false, 1).then((res) => {
        expect(res).toBe(testValue);
        resolve();
      });
    });
  });
});

it("CRDTs", () => {
  return new Promise<void>((resolve) => {
    const crdtKey = "crdt-test-" + textRandom(16);
    const crdtValue = textRandom(24);

    const origDoc = Automerge.init();
    const oneDoc = Automerge.change(origDoc, (doc: any) => {
      doc.test = crdtValue;
      doc.arr = ["arr"];
    });

    const newDoc = Automerge.change(oneDoc, (doc: any) => {
      doc.arr.push("test");
    });

    const changes = Automerge.getChanges(origDoc, newDoc);
    Alice.putCrdt(crdtKey, changes).then(async (put) => {
      setTimeout(() => {
        Bob.getCrdt(crdtKey).then((data) => {
          const doc = Automerge.load(data as any) as any;
          expect(doc.test).toBe(crdtValue);
          expect(doc.arr).toStrictEqual(["arr", "test"]);
          resolve();
        });
      }, 1000);
    });
  });
});
