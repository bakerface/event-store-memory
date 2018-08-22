import { Key, Subject } from "./EventStore";

export interface Snapshot<State> {
  readonly key: Key;
  readonly state: State;
}

export interface SnapshotStore<State> {
  fetch(subject: Subject): Promise<Snapshot<State> | undefined>;
  save(subject: Subject, snapshot: Snapshot<State>): Promise<void>;
}
