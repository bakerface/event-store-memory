import { EventStore, Page, Subject, Version } from "./EventStore";
import { EventStoreVersionConflictError } from "./EventStoreVersionConflictError";
import { EventStoreVersionInvalidError } from "./EventStoreVersionInvalidError";

export type ExtractSubject<Event> = (e: Event) => Subject;

export class MemoryEventStore<Event> implements EventStore<Event> {
  private events: Event[];
  private extractSubject: ExtractSubject<Event>;

  public constructor(extractSubject: ExtractSubject<Event>) {
    this.extractSubject = extractSubject;
    this.events = [];
  }

  public append(e: Event, version: Version = "0"): Promise<Page<Event>> {
    const offset = parseInt(version, 10);

    if (isNaN(offset)) {
      return Promise.reject(new EventStoreVersionInvalidError());
    }

    const subject = this.extractSubject(e);

    const expected = this.events
      .filter((x) => this.extractSubject(x) === subject)
      .length;

    if (offset !== expected) {
      return Promise.reject(new EventStoreVersionConflictError());
    }

    this.events.push(e);

    return Promise.resolve({
      events: [ e ],
      next: "" + (offset + 1),
      version,
    });
  }

  public fetch(subject: Subject, version: Version = "0"): Promise<Page<Event>> {
    const offset = parseInt(version, 10);

    if (isNaN(offset)) {
      return Promise.reject(new EventStoreVersionInvalidError());
    }

    const events = this.events
      .filter((x) => this.extractSubject(x) === subject)
      .slice(offset);

    return Promise.resolve({
      events,
      next: "" + (offset + events.length),
      version,
    });
  }

  public scan(version: Version = "0"): Promise<Page<Event>> {
    const offset = parseInt(version, 10);

    if (isNaN(offset)) {
      return Promise.reject(new EventStoreVersionInvalidError());
    }

    const events = this.events.slice(offset);

    return Promise.resolve({
      events,
      next: "" + (offset + events.length),
      version,
    });
  }
}
