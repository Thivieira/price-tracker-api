# Twilio Test Credentials - SMS Testing

## From Numbers

| Test Number | Description | Error Code |
|------------|-------------|------------|
| +15005550001 | This phone number is invalid | 21212 |
| +15005550007 | This phone number is not owned by your account or is not SMS-capable | 21606 |
| +15005550008 | This number has an SMS message queue that is full | 21611 |
| +15005550006 | This number passes all validation | No error |
| All Others | This phone number is not owned by your account or is not SMS-capable | 21606 |

## To Numbers

| Test Number | Description | Error Code |
|------------|-------------|------------|
| +15005550001 | This phone number is invalid | 21211 |
| +15005550002 | Twilio cannot route to this number | 21612 |
| +15005550003 | Your account doesn't have the international permissions necessary to SMS this number | 21408 |
| +15005550004 | This number is blocked for your account | 21610 |
| +15005550009 | This number is incapable of receiving SMS messages | 21614 |
| All Others | Any other phone number is validated normally | Input-dependent |

## Reference
For more information, see the [Twilio Test Credentials Documentation](https://www.twilio.com/docs/iam/test-credentials#test-sms-messages)