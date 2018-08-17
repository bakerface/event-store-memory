import { expect } from "chai";
import { EventStoreVersionConflictError, MemoryEventStore } from "../src";

interface CounterEvent {
  readonly counterId: string;
  readonly type: "inc" | "dec";
}

describe("appending an event", () => {
  let eventStore: MemoryEventStore<CounterEvent>;

  beforeEach(() => {
    eventStore = new MemoryEventStore<CounterEvent>(
      (e) => e.counterId,
    );
  });

  describe("when there are no events", () => {
    it("can append without a version", async () => {
      const page = await eventStore.append({ counterId: "0", type: "inc" });

      expect(page.events).eqls([
        { counterId: "0", type: "inc" },
      ]);

      expect(page.next).equals("1");
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

    it("cannot append without a version", async () => {
      try {
        await eventStore.append({ counterId: "0", type: "inc" });
      } catch (err) {
        expect(err).instanceOf(EventStoreVersionConflictError);
      }
    });

    it("cannot append to an old version", async () => {
      try {
        await eventStore.append({ counterId: "0", type: "inc" }, "1");
      } catch (err) {
        expect(err).instanceOf(EventStoreVersionConflictError);
      }
    });

    it("can append to the latest version", async () => {
      const page = await eventStore.append({ counterId: "0", type: "inc" }, "3");

      expect(page.events).eqls([
        { counterId: "0", type: "inc" },
      ]);

      expect(page.next).equals("4");
    });
  });
});
