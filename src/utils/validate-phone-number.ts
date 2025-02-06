import { parsePhoneNumberWithError } from "libphonenumber-js";

export default function validatePhoneNumber(value: string, callingCode: string | undefined) {
  try {
    const phoneNumber = parsePhoneNumberWithError(value, { defaultCallingCode: callingCode });

    if (!phoneNumber?.isValid()) {
      return 'Please enter a valid phone number';
    }

    const nationalNumber = phoneNumber.nationalNumber;
    if (!nationalNumber || nationalNumber.length < 6) {
      return 'Phone number is too short';
    }

    if (nationalNumber.length > 15) {
      return 'Phone number is too long';
    }

    return true;
  } catch (error) {
    console.log(error, 'error');
    return 'Please enter a valid phone number';
  }
}

export function extractCallingCode(value: string) {
  const phoneNumber = parsePhoneNumberWithError(value);
  return phoneNumber?.countryCallingCode;
}

