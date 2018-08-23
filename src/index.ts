export type EventStoreKey = string;
export type EventStoreSubject = string;

export interface EventStoreRecord<Event> {
  readonly event: Event;
  readonly subject: EventStoreSubject;
}

export interface EventStorePage<Event> {
  readonly key: EventStoreKey;
  readonly items: ReadonlyArray<EventStoreRecord<Event>>;
}

export type EventStoreAppend<Event> = (
  subject: EventStoreSubject,
  events: Event[],
  key?: EventStoreKey,
) => Promise<EventStorePage<Event>>;

export type EventStoreFetch<Event> = (
  subject: EventStoreSubject,
  key?: EventStoreKey,
) => Promise<EventStorePage<Event>>;

export type EventStoreScan<Event> = (
  key?: EventStoreKey,
) => Promise<EventStorePage<Event>>;

export interface EventStore<Event> {
  readonly append: EventStoreAppend<Event>;
  readonly fetch: EventStoreFetch<Event>;
  readonly scan: EventStoreScan<Event>;
}

export class EventStoreKeyConflictError extends Error {
  public key: EventStoreKey;
  public status: number;

  public constructor(key: EventStoreKey) {
    super();

    this.name = "EventStoreKeyConflictError";
    this.message = "Unable to append the events, because an event with the specified key already exists";
    this.key = key;
    this.status = 409;
  }
}

export class MemoryEventStore<Event> implements EventStore<Event> {
  private records: ReadonlyArray<EventStoreRecord<Event>> = [];

  public constructor(private limit?: number) {}

  public append: EventStoreAppend<Event> = (subject, events, key = "0") => {
    const count = this.records
      .filter((r) => r.subject === subject)
      .length;

    if (key !== count.toString()) {
      return Promise.reject(new EventStoreKeyConflictError(key));
    }

    const records = events.map((event): EventStoreRecord<Event> =>
      ({ event, subject }));

    this.records = this.records.concat(records);

    const page: EventStorePage<Event> = {
      items: records,
      key: (count + records.length).toString(),
    };

    return Promise.resolve(page);
  }

  public fetch: EventStoreFetch<Event> = (subject, key = "0") => {
    const offset = Math.floor(+key);

    const records = this.records
      .filter((r) => r.subject === subject)
      .slice(offset, this.limit && offset + this.limit);

    const page: EventStorePage<Event> = {
      items: records,
      key: (offset + records.length).toString(),
    };

    return Promise.resolve(page);
  }

  public scan: EventStoreScan<Event> = (key = "0") => {
    const offset = Math.floor(+key);

    const records = this.records
      .slice(offset, this.limit && offset + this.limit);

    const page: EventStorePage<Event> = {
      items: records,
      key: (offset + records.length).toString(),
    };

    return Promise.resolve(page);
  }
}
