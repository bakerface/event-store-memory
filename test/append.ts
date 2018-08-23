import { expect } from "chai";
import { EventStore, MemoryEventStore } from "../src";

describe("MemoryEventStore#append(subject, events, [key])", () => {
  let eventStore: EventStore<string>;

  beforeEach(async () => {
    eventStore = new MemoryEventStore<string>();

    await eventStore.append("A", [ "foo" ]);
    await eventStore.append("B", [ "foo", "bar" ]);
    await eventStore.append("C", [ "foo", "bar", "baz" ]);
  });

  it("can append to new subjects without a key", async () => {
    const page = await eventStore.append("D", [ "foo" ]);

    expect(page).eqls({
      items: [
        { subject: "D", event: "foo" },
      ],
      key: "1",
    });
  });

  it("cannot append to existing subjects without a key", async () => {
    try {
      await eventStore.append("A", [ "foo" ]);
    } catch (err) {
      expect(err.name).equals("EventStoreKeyConflictError");
      expect(err.key).equals("0");
      expect(err.status).equals(409);
    }
  });

  it("can append to subjects with the appropriate key", async () => {
    const page = await eventStore.append("A", [ "bar" ], "1");

    expect(page).eqls({
      items: [
        { subject: "A", event: "bar" },
      ],
      key: "2",
    });
  });

  it("cannot append to subjects with an existing key", async () => {
    try {
      await eventStore.append("B", [ "bar" ], "1");
    } catch (err) {
      expect(err.name).equals("EventStoreKeyConflictError");
      expect(err.key).equals("1");
      expect(err.status).equals(409);
    }
  });
});
