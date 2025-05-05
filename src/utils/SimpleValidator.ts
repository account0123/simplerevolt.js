// Internal validator class
export class SimpleValidator {
  static validateStringLength(source: string, name = "String", min = 0, max = Infinity) {
    if (source.length < min || source.length > max) {
      throw new TypeError(`${name} must be between ${min} and ${max} characters long`);
    }
  }

  static validateType(
    source: unknown,
    name = "Variable",
    type: "string" | "number" | "boolean" | "object" | "function" | "bigint" | "symbol",
    options: {
      allowNull?: boolean;
      allowUndefined?: boolean;
    } = {
      allowNull: false,
      allowUndefined: false,
    },
  ) {
    const allowedTypes: string[] = [type];
    if (options.allowNull) allowedTypes.push("null");
    if (options.allowUndefined) allowedTypes.push("undefined");

    if (source === undefined && !options.allowUndefined) {
      throw new TypeError(`${name} is undefined, but must be of type ${allowedTypes.join(" | ")}`);
    }
    if (source === null) {
      if (options.allowNull) {
        return;
      }
      throw new TypeError(`${name} is null, but must be of type ${allowedTypes.join(" | ")}`);
    }
    if (typeof source != type) {
      throw new TypeError(`${name} must be of type ${allowedTypes.join(" | ")}`);
    }
  }
}
