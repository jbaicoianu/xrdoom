export class Enum {
  constructor(values) {
    for (var i = 0; i < values.length; i++) {
      this[values[i]] = i;
    }
  }
  static define(values) {
    return new Enum(values);
  }
}
