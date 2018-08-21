import { expect } from "chai";
import { MemoryEventStore } from "../src";
import { CounterEvent, dec, inc } from "./Counter";

describe("scanning events", () => {
  let eventStore: MemoryEventStore<CounterEvent>;

  beforeEach(() => {
    eventStore = new MemoryEventStore<CounterEvent>(
      (e) => e.counterId,
    );
  });

  describe("when there are no events", () => {
    it("can scan without a version", async () => {
      const page = await eventStore.scan();

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

    it("can scan without a version", async () => {
      const page = await eventStore.scan();

      expect(page.events).eqls([
        { counterId: "0", type: "inc" },
        { counterId: "0", type: "dec" },
        { counterId: "1", type: "inc" },
        { counterId: "0", type: "inc" },
        { counterId: "1", type: "dec" },
      ]);

      expect(page.next).equals("5");
    });

    it("can scan starting at a specific version", async () => {
      const page = await eventStore.scan("2");

      expect(page.events).eqls([
        { counterId: "1", type: "inc" },
        { counterId: "0", type: "inc" },
        { counterId: "1", type: "dec" },
      ]);

      expect(page.next).equals("5");
    });
  });
});
