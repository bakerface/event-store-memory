import { EventStore, Key, Subject } from "./EventStore";
import { EventStoreVersionConflictError } from "./EventStoreVersionConflictError";
import { EventStoreVersionInvalidError } from "./EventStoreVersionInvalidError";

export type ExtractSubject<Event> = (e: Event) => Subject;

function toOffset(key: Key = "0"): number {
  const offset = parseInt(key, 10);

  if (isNaN(offset)) {
    throw new EventStoreVersionInvalidError();
  }

  return offset;
}

export class MemoryEventStore<Event> implements EventStore<Event> {
  private events: Event[];
  private extractSubject: ExtractSubject<Event>;
  private limit: number;

  public constructor(extractSubject: ExtractSubject<Event>, limit = 10) {
    this.extractSubject = extractSubject;
    this.events = [];
    this.limit = limit;
  }

  public async append(events: Event[], key?: Key) {
    const version = toOffset(key);

    if (events.length === 0) {
      return {
        events,
        next: "" + version,
      };
    }

    const subject = this.extractSubject(events[0]);

    const expected = this.events
      .filter((x) => this.extractSubject(x) === subject)
      .length;

    if (version !== expected) {
      throw new EventStoreVersionConflictError();
    }

    this.events = this.events.concat(events);

    return {
      events,
      next: "" + (version + events.length),
    };
  }

  public async fetch(subject: Subject, key?: Key) {
    const version = toOffset(key);

    const events = this.events
      .filter((x) => this.extractSubject(x) === subject)
      .slice(version, version + this.limit);

    return {
      events,
      next: "" + (version + events.length),
    };
  }

  public async scan(key?: Key) {
    const offset = toOffset(key);
    const events = this.events.slice(offset, offset + this.limit);

    return {
      events,
      next: "" + (offset + events.length),
    };
  }
}
