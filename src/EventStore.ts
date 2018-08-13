export type Version = string;
export type Subject = string;

export interface Page<Event> {
  readonly version: Version;
  readonly events: Event[];
  readonly next: Version;
}

export interface EventStore<Event> {
  readonly append: (e: Event, subject: Subject, version?: Version) => Promise<Page<Event>>;
  readonly fetch: (subject: Subject, version?: Version) => Promise<Page<Event>>;
  readonly scan: (version?: Version) => Promise<Page<Event>>;
}
