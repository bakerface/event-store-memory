export type Key = string;
export type Subject = string;

export interface Page<Event> {
  readonly events: Event[];
  readonly next: Key;
}

export interface EventStore<Event> {
  append(e: Event, key?: Key): Promise<Page<Event>>;
  fetch(subject: Subject, key?: Key): Promise<Page<Event>>;
  scan(key?: Key): Promise<Page<Event>>;
}
