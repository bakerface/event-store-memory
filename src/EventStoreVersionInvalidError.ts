export class EventStoreVersionInvalidError extends Error {
  public status = 400;
  public name = "EventStoreVersionInvalidError";
  public message = "This version is not valid";
}
