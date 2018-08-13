export class EventStoreVersionConflictError extends Error {
  public status = 409;
  public name = "EventStoreVersionConflictError";
  public message = "An event with this version already exists";
}
