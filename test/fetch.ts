import { expect } from "chai";
import { MemoryEventStore } from "../src";

interface CounterEvent {
  readonly counterId: string;
  readonly type: "inc" | "dec";
}

describe("fetching events", () => {
  let eventStore: MemoryEventStore<CounterEvent>;

  beforeEach(async () => {
    eventStore = new MemoryEventStore<CounterEvent>(
      (e) => e.counterId,
    );
  });

  describe("when there are no events", () => {
    it("can fetch without a version", async () => {
      const page = await eventStore.fetch("0");

      expect(page.events).has.lengthOf(0);
      expect(page.version).equals("0");
      expect(page.next).equals("0");
    });
  });

  describe("when there are events", () => {
    beforeEach(async () => {
      await eventStore.append({ counterId: "0", type: "inc" });
      await eventStore.append({ counterId: "0", type: "dec" }, "1");
      await eventStore.append({ counterId: "1", type: "inc" });
      await eventStore.append({ counterId: "0", type: "inc" }, "2");
      await eventStore.append({ counterId: "1", type: "dec" }, "1");
    });

    it("can fetch without a version", async () => {
      const page = await eventStore.fetch("0");

      expect(page.events).eqls([
        { counterId: "0", type: "inc" },
        { counterId: "0", type: "dec" },
        { counterId: "0", type: "inc" },
      ]);

      expect(page.version).equals("0");
      expect(page.next).equals("3");
    });

    it("can fetch starting at a specific version", async () => {
      const page = await eventStore.fetch("0", "2");

      expect(page.events).eqls([
        { counterId: "0", type: "inc" },
      ]);

      expect(page.version).equals("2");
      expect(page.next).equals("3");
    });
  });
});
