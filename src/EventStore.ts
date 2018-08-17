export type Cursor = string;
export type Subject = string;

export interface Page<Event> {
  readonly events: Event[];
  readonly next: Cursor;
}

export interface EventStore<Event> {
  append(e: Event, subject: Subject, cursor?: Cursor): Promise<Page<Event>>;
  fetch(subject: Subject, version?: Cursor): Promise<Page<Event>>;
  scan(cursor?: Cursor): Promise<Page<Event>>;
}
