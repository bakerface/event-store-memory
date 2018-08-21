export interface CounterEvent {
  readonly type: "inc" | "dec";
  readonly counterId: string;
}

export const inc = (counterId: string): CounterEvent =>
  ({ type: "inc", counterId });

export const dec = (counterId: string): CounterEvent =>
  ({ type: "dec", counterId });
