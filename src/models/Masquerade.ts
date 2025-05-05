import type { Masquerade as ApiMasquerade } from "revolt-api";
import { SimpleValidator } from "../utils/SimpleValidator";

export class Masquerade {
  private _name: string | null = null;
  private _avatar: string | null = null;
  private _colour: string | null = null;
  constructor({ name, avatar, colour }: ApiMasquerade) {
    this.name = name || null;
    this.avatar = avatar || null;
    this.colour = colour || null;
  }

  get avatar() {
    return this._avatar;
  }

  set avatar(avatar: string | null) {
    SimpleValidator.validateType(avatar, "Masquerade.avatar", "string", { allowNull: true });
    if (typeof avatar == "string") {
      SimpleValidator.validateStringLength(avatar, "Masquerade.avatar", 1, 256);
      this._avatar = avatar;
      return;
    }
    this._avatar = null;
  }

  get colour() {
    return this._colour;
  }

  set colour(colour: string | null) {
    SimpleValidator.validateType(colour, "Masquerade.colour", "string", { allowNull: true });
    if (typeof colour == "string") {
      SimpleValidator.validateStringLength(colour, "Masquerade.colour", 1, 128);
      this._colour = colour;
      return;
    }
    this._colour = null;
  }

  get name() {
    return this._name;
  }

  set name(name: string | null) {
    SimpleValidator.validateType(name, "Masquerade.name", "string", { allowNull: true });
    if (typeof name == "string") {
      SimpleValidator.validateStringLength(name, "Masquerade.name", 1, 32);
      this._name = name;
      return;
    }
    this._name = null;
  }
}
