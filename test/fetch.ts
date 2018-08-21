import { expect } from "chai";
import { MemoryEventStore } from "../src";
import { CounterEvent, dec, inc } from "./Counter";

describe("fetching events", () => {
  let eventStore: MemoryEventStore<CounterEvent>;

  beforeEach(() => {
    eventStore = new MemoryEventStore<CounterEvent>(
      (e) => e.counterId,
    );
  });

  describe("when there are no events", () => {
    it("can fetch without a version", async () => {
      const page = await eventStore.fetch("0");

      expect(page.events).has.lengthOf(0);
      expect(page.next).equals("0");
    });
  });

  describe("when there are events", () => {
    beforeEach(async () => {
      await eventStore.append([ inc("0"), dec("0") ]);
      await eventStore.append([ inc("1") ]);
      await eventStore.append([ inc("0") ], "2");
      await eventStore.append([ dec("1") ], "1");
    });

    it("can fetch without a version", async () => {
      const page = await eventStore.fetch("0");

      expect(page.events).eqls([
        { counterId: "0", type: "inc" },
        { counterId: "0", type: "dec" },
        { counterId: "0", type: "inc" },
      ]);

      expect(page.next).equals("3");
    });

    it("can fetch starting at a specific version", async () => {
      const page = await eventStore.fetch("0", "2");

      expect(page.events).eqls([
        { counterId: "0", type: "inc" },
      ]);

      expect(page.next).equals("3");
    });
  });
});
