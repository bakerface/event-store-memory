import { Subject } from "./EventStore";
import { Snapshot, SnapshotStore } from "./SnapshotStore";

interface Snapshots<State> {
  [subject: string]: Snapshot<State> | undefined;
}

export class MemorySnapshotStore<State> implements SnapshotStore<State> {
  private snapshots: Snapshots<State> = {};

  public async fetch(subject: Subject) {
    return this.snapshots[subject];
  }

  public async save(subject: Subject, snapshot: Snapshot<State>) {
    this.snapshots[subject] = snapshot;
  }
}
