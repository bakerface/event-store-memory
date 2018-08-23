import { expect } from "chai";
import { EventStore, MemoryEventStore } from "../src";

describe("MemoryEventStore#fetch(subject, [key])", () => {
  let eventStore: EventStore<string>;

  beforeEach(async () => {
    eventStore = new MemoryEventStore<string>(2);

    await eventStore.append("A", [ "foo" ]);
    await eventStore.append("B", [ "foo", "bar" ]);
    await eventStore.append("C", [ "foo", "bar", "baz" ]);
  });

  it("can fetch unknown subjects without a key", async () => {
    const page = await eventStore.fetch("D");

    expect(page).eqls({
      items: [],
      key: "0",
    });
  });

  it("can fetch known subjects without a key", async () => {
    const page = await eventStore.fetch("B");

    expect(page).eqls({
      items: [
        { event: "foo", subject: "B" },
        { event: "bar", subject: "B" },
      ],
      key: "2",
    });
  });

  it("can fetch known subjects with a key", async () => {
    const page = await eventStore.fetch("C", "2");

    expect(page).eqls({
      items: [
        { event: "baz", subject: "C" },
      ],
      key: "3",
    });
  });

  it("can fetch with a limit", async () => {
    const page = await eventStore.fetch("C");

    expect(page).eqls({
      items: [
        { event: "foo", subject: "C" },
        { event: "bar", subject: "C" },
      ],
      key: "2",
    });
  });
});
