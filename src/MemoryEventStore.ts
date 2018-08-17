import { Cursor, EventStore, Page, Subject } from "./EventStore";
import { EventStoreVersionConflictError } from "./EventStoreVersionConflictError";
import { EventStoreVersionInvalidError } from "./EventStoreVersionInvalidError";

export type ExtractSubject<Event> = (e: Event) => Subject;

export class MemoryEventStore<Event> implements EventStore<Event> {
  private events: Event[];
  private extractSubject: ExtractSubject<Event>;
  private limit: number;

  public constructor(extractSubject: ExtractSubject<Event>, limit = 10) {
    this.extractSubject = extractSubject;
    this.events = [];
    this.limit = limit;
  }

  public append(e: Event, cursor: Cursor = "0"): Promise<Page<Event>> {
    const version = parseInt(cursor, 10);

    if (isNaN(version)) {
      return Promise.reject(new EventStoreVersionInvalidError());
    }

    const subject = this.extractSubject(e);

    const expected = this.events
      .filter((x) => this.extractSubject(x) === subject)
      .length;

    if (version !== expected) {
      return Promise.reject(new EventStoreVersionConflictError());
    }

    this.events.push(e);

    return Promise.resolve({
      events: [ e ],
      next: "" + (version + 1),
    });
  }

  public fetch(subject: Subject, cursor: Cursor = "0"): Promise<Page<Event>> {
    const version = parseInt(cursor, 10);

    if (isNaN(version)) {
      return Promise.reject(new EventStoreVersionInvalidError());
    }

    const events = this.events
      .filter((x) => this.extractSubject(x) === subject)
      .slice(version, version + this.limit);

    return Promise.resolve({
      events,
      next: "" + (version + events.length),
    });
  }

  public scan(cursor: Cursor = "0"): Promise<Page<Event>> {
    const offset = parseInt(cursor, 10);

    if (isNaN(offset)) {
      return Promise.reject(new EventStoreVersionInvalidError());
    }

    const events = this.events.slice(offset, offset + this.limit);

    return Promise.resolve({
      events,
      next: "" + (offset + events.length),
    });
  }
}
