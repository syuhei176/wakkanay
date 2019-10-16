export class Option<T> {
  public static Some<T>(data: T) {
    return new Option(data)
  }
  public static None<T>() {
    return new Option<T>(undefined)
  }
  public data?: T
  constructor(data?: T) {
    this.data = data
  }
  public unwrap(): T {
    if (this.data) {
      return this.data
    } else {
      throw new Error('Option is none')
    }
  }
  public isSome(): boolean {
    return !!this.data
  }
  public orDefault(d: T): T {
    if (this.data) {
      return this.data
    } else {
      return d
    }
  }
  public map<K>(fn: (data: T) => K): Option<K> {
    if (this.data) {
      return Option.Some<K>(fn(this.data))
    } else {
      return Option.None()
    }
  }
}
