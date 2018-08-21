import { expect } from "chai";
import { MemoryEventStore } from "../src";
import { CounterEvent, dec, inc } from "./Counter";

describe("appending events", () => {
  let eventStore: MemoryEventStore<CounterEvent>;

  beforeEach(() => {
    eventStore = new MemoryEventStore<CounterEvent>(
      (e) => e.counterId,
    );
  });

  describe("when there are no events", () => {
    it("can append without a version", async () => {
      const page = await eventStore.append([
        inc("0"),
      ]);

      expect(page.events).eqls([
        inc("0"),
      ]);

      expect(page.next).equals("1");
    });
  });

  describe("when there are events", () => {
    beforeEach(async () => {
      await eventStore.append([ inc("0"), dec("0") ]);
      await eventStore.append([ inc("1") ]);
      await eventStore.append([ inc("0") ], "2");
      await eventStore.append([ dec("1") ], "1");
    });

    it("cannot append without a version", async () => {
      try {
        await eventStore.append([ inc("0") ]);
      } catch (err) {
        expect(err.name).equals("EventStoreVersionConflictError");
      }
    });

    it("cannot append to an old version", async () => {
      try {
        await eventStore.append([ inc("0") ], "1");
      } catch (err) {
        expect(err.name).equals("EventStoreVersionConflictError");
      }
    });

    it("can append to the latest version", async () => {
      const page = await eventStore.append([ inc("0") ], "3");

      expect(page.events).eqls([
        { counterId: "0", type: "inc" },
      ]);

      expect(page.next).equals("4");
    });
  });
});
