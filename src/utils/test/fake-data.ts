function generateUniqueId() {
  return Math.random().toString(36).substring(7)
}

export function createFakeUserRegisterInput(overrides = {}) {
  const uniqueId = generateUniqueId()

  return {
    first_name: 'Test User',
    last_name: 'Test User',
    username: `testuser_${uniqueId}`,
    email: `test_${uniqueId}@example.com`,
    password: 'password123',
    phone: `1234567${uniqueId}`,
    password_confirmation: 'password123',
    birthdate: '1990-01-01',
    street_address: '1234 Main St',
    unit_number: '1A',
    city: 'Anytown',
    region: 'CA',
    zip_code: '12345',
    raw_pin: '1234',
    ...overrides
  }
}

export const fakeUserRegisterInput = createFakeUserRegisterInput()

export const fakeUserLoginInput = {
  withEmail: {
    username_or_email: fakeUserRegisterInput.email,
    password: fakeUserRegisterInput.password
  },
  withUsername: {
    username_or_email: fakeUserRegisterInput.username,
    password: fakeUserRegisterInput.password
  }
} as const 