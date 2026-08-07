export class InvalidPasswordError extends Error {
  constructor() {
    super("Incorrect password.");
    this.name = "InvalidPasswordError";
  }
}

export class WalletAlreadyExistsError extends Error {
  constructor() {
    super("A wallet already exists on this device. Disconnect or remove it first.");
    this.name = "WalletAlreadyExistsError";
  }
}

export class NoStoredWalletError extends Error {
  constructor() {
    super("No wallet found on this device.");
    this.name = "NoStoredWalletError";
  }
}

export class InvalidSecretKeyError extends Error {
  constructor() {
    super("That doesn't look like a valid Stellar secret key.");
    this.name = "InvalidSecretKeyError";
  }
}

export class PasswordTooWeakError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PasswordTooWeakError";
  }
}
