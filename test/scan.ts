import { expect } from "chai";
import { EventStore, MemoryEventStore } from "../src";

describe("MemoryEventStore#scan([key])", () => {
  let eventStore: EventStore<string>;

  beforeEach(async () => {
    eventStore = new MemoryEventStore<string>(4);

    await eventStore.append("A", [ "foo" ]);
    await eventStore.append("B", [ "foo", "bar" ]);
    await eventStore.append("C", [ "foo", "bar", "baz" ]);
  });

  it("can scan without a key", async () => {
    const page = await eventStore.scan();

    expect(page).eqls({
      items: [
        { event: "foo", subject: "A" },
        { event: "foo", subject: "B" },
        { event: "bar", subject: "B" },
        { event: "foo", subject: "C" },
      ],
      key: "4",
    });
  });

  it("can scan with a key", async () => {
    const page = await eventStore.scan("4");

    expect(page).eqls({
      items: [
        { event: "bar", subject: "C" },
        { event: "baz", subject: "C" },
      ],
      key: "6",
    });
  });
});
