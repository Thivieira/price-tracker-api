export class UserCreationException extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UserCreationException'
  }
}

export class UserNotFoundException extends Error {
  constructor(message: string = 'User not found') {
    super(message)
    this.name = 'UserNotFoundException'
  }
}

export class UserUpdateException extends Error {
  constructor(message: string = 'Failed to update user') {
    super(message)
    this.name = 'UserUpdateException'
  }
}

// Add other user-related exceptions here
