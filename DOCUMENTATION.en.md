# Faker Chan for Insomnia

> Русская версия: [DOCUMENTATION.ru.md](DOCUMENTATION.ru.md)

Faker Chan is an Insomnia plugin that generates synthetic values while an HTTP request is prepared

## Quick start

1. Open a URL, query parameter, header, request body, or authorization field
2. Press `Ctrl+Space` and open the Template Tags list
3. Search for the `FakeC` prefix
4. Select a tag and fill in its options when available

Insomnia inserts the tag expression into the selected field and evaluates it while rendering the request

```json
{
  "email": "<FakeC - Contact Email>",
  "requestId": "<FakeC - Identifier UUID>",
  "createdAt": "<FakeC - Date & Time ISO Timestamp>"
}
```

Tags return ready-to-use values without extra quotation marks, so the expression belongs inside a JSON string and the field determines the resulting type

## Tag model

Each tag is exported from `index.js` as an object with five important properties

| Property | Purpose |
| --- | --- |
| `name` | Internal name used by Insomnia during evaluation |
| `displayName` | Name shown in the Template Tags list with the `FakeC` prefix |
| `description` | Short description shown by Insomnia |
| `args` | Options, types, defaults, and enum values |
| `run` | Function that returns the tag value |

`main.js` is the stable entry point and exposes the same `templateTags` array to Insomnia

Tag names are not localized while the application is running: the Insomnia plugin API provides a static `displayName` field and does not provide the current interface language. The `FakeC` prefix therefore provides one predictable search and display name, while categories and options remain in English

Descriptions in the Insomnia list omit final periods so list items keep one visual style

## Generator catalog

The project contains 45 tags in 9 groups

### Identifiers

| Display name | Internal name | Options | Result |
| --- | --- | --- | --- |
| `FakeC - Identifier UUID` | `fakerUuid` | None | UUID v4 |
| `FakeC - Identifier GUID` | `fakerGuid` | `Braces`: `false` | UUID v4, wrapped in `{}` when `true` |
| `FakeC - Identifier Random ID` | `fakerRandomId` | `Length`: `10`, `Character Set`: `alphanumeric` | String of letters and digits |
| `FakeC - Identifier Counter` | `fakerCounter` | `Scope`: `folder`, `Counter Name`: `id`, `Initial Value`: `0`, `Step`: `1`, `Prefix`: empty, `Suffix`: empty, `Padding`: `0` | Sequential number with formatting |

`Random ID` supports `digits`, `letters`, `alphanumeric`, `lowercase`, and `uppercase`

### Person and contact data

| Display name | Internal name | Options | Result |
| --- | --- | --- | --- |
| `FakeC - Person First Name` | `fakerFirstName` | None | Russian first name from the built-in set |
| `FakeC - Person Last Name` | `fakerLastName` | None | Russian last name from the built-in set |
| `FakeC - Person Username` | `fakerUsername` | `Strategy`: `name-dot-last` | ASCII username |
| `FakeC - Contact Email` | `fakerEmail` | None | Address on `example.com`, `example.org`, or `example.net` |
| `FakeC - Contact Phone Number` | `fakerPhoneRu` | None | Russian mobile number in `+79XXXXXXXXX` format |

`Username` supports `random`, `name-dot-last`, `last-number`, and `user-number`

### Locations and coordinates

| Display name | Internal name | Options | Result |
| --- | --- | --- | --- |
| `FakeC - Location Country` | `fakerCountry` | None | `Россия` |
| `FakeC - Location City` | `fakerCity` | None | Russian city from the built-in set |
| `FakeC - Location Street` | `fakerStreet` | None | Street name from the built-in set |
| `FakeC - Location Postal Code` | `fakerPostalCode` | None | Six digits |
| `FakeC - Location Full Address` | `fakerFullAddress` | None | City, street, and house number |
| `FakeC - Location Latitude` | `fakerLatitude` | `Precision`: `6` | Latitude from `-90` to `90` |
| `FakeC - Location Longitude` | `fakerLongitude` | `Precision`: `6` | Longitude from `-180` to `180` |
| `FakeC - Location Coordinates` | `fakerCoordinates` | `Precision`: `6` | Latitude and longitude separated by `, ` |

`Precision` is clamped to 0 through 12 decimal places

### Date and time

| Display name | Internal name | Options | Result |
| --- | --- | --- | --- |
| `FakeC - Date & Time Current Date` | `fakerCurrentDate` | `Format`: `YYYY-MM-DD` | Current UTC date |
| `FakeC - Date & Time Past Date` | `fakerPastDate` | `Range (days)`: `30`, `Format`: `YYYY-MM-DD` | Date from 1 to the selected number of days ago |
| `FakeC - Date & Time Future Date` | `fakerFutureDate` | `Range (days)`: `30`, `Format`: `YYYY-MM-DD` | Date from 1 to the selected number of days ahead |
| `FakeC - Date & Time Unix Timestamp` | `fakerUnixTimestamp` | `Unit`: `seconds` | Unix time in seconds or milliseconds |
| `FakeC - Date & Time ISO Timestamp` | `fakerIsoTimestamp` | None | Current ISO 8601 timestamp in UTC |

Date formatting supports `YYYY`, `MM`, and `DD`. `Range (days)` is clamped to 1 through 36500

### Numbers

| Display name | Internal name | Default options | Result |
| --- | --- | --- | --- |
| `FakeC - Number Positive Integer` | `fakerPositiveInteger` | `Min`: `1`, `Max`: `1000` | Positive integer |
| `FakeC - Number Negative Integer` | `fakerNegativeInteger` | `Min`: `-1000`, `Max`: `-1` | Negative integer |
| `FakeC - Number Decimal` | `fakerDecimal` | `Min`: `0`, `Max`: `1000`, `Precision`: `2` | Decimal number with fixed precision |
| `FakeC - Number Percentage` | `fakerPercentage` | `Mode`: `integer`, `Precision`: `2` | Value from 0 to 100 |
| `FakeC - Number Number in Range` | `fakerNumberRange` | `Min`: `0`, `Max`: `100`, `Mode`: `integer` | Integer or decimal within the range |

Decimal precision is clamped to 0 through 12 places. If the minimum exceeds the maximum, the bounds are swapped

### Strings

| Display name | Internal name | Options | Result |
| --- | --- | --- | --- |
| `FakeC - String Length 0` | `fakerString0` | None | Empty string |
| `FakeC - String Length 1` | `fakerString1` | None | 1 alphanumeric character |
| `FakeC - String Length 255` | `fakerString255` | None | 255 alphanumeric characters |
| `FakeC - String Length 256` | `fakerString256` | None | 256 alphanumeric characters |
| `FakeC - String Length 1025` | `fakerString1025` | None | 1025 alphanumeric characters |
| `FakeC - String Length 4096` | `fakerString4096` | None | 4096 alphanumeric characters |
| `FakeC - String Custom Length` | `fakerCustomString` | `Length`: `16`, `Character Set`: `alphanumeric` | String from 0 through 100000 characters |

`Custom Length` supports `latin`, `numeric`, and `alphanumeric`

### JWT and security

| Display name | Internal name | Options | Result |
| --- | --- | --- | --- |
| `FakeC - Security Random JWT` | `fakerRandomJwt` | None | Synthetic value with three JWT-shaped segments |
| `FakeC - Security Unsigned JWT` | `fakerUnsignedJwt` | None | JWT with `alg: none` and an empty signature |
| `FakeC - Security Signed JWT (HS256)` | `fakerSignedJwtHs256` | `Secret`: `test-secret`, `Payload JSON`: `{"sub":"1234567890"}`, `Expiration (seconds)`: `3600` | HMAC-SHA256 signed JWT |

These tags provide test data. `Unsigned JWT` does not prove authenticity and belongs only in authorised negative scenarios. The `Signed JWT` secret is used in memory during evaluation and is not stored by the plugin

Invalid `Payload JSON` falls back to `{"sub":"1234567890"}`. The expiration is clamped to 1 through 31536000 seconds

### HTTP

| Display name | Internal name | Options | Result |
| --- | --- | --- | --- |
| `FakeC - HTTP User-Agent` | `fakerUserAgent` | None | Common Chrome, Safari, or Linux browser User-Agent |
| `FakeC - HTTP Content-Type` | `fakerContentType` | None | One of the common Content-Type values |
| `FakeC - HTTP Accept` | `fakerAccept` | None | One of the common Accept values |
| `FakeC - HTTP Accept-Language` | `fakerAcceptLanguage` | None | `ru-RU`, `en-US`, or `de-DE` |
| `FakeC - HTTP Authorization` | `fakerAuthorization` | `Scheme`: `bearer` | Bearer or Basic authorization |
| `FakeC - HTTP X-Request-ID` | `fakerXRequestId` | None | UUID v4 |
| `FakeC - HTTP X-Correlation-ID` | `fakerXCorrelationId` | None | UUID v4 |
| `FakeC - HTTP X-Forwarded-For` | `fakerXForwardedFor` | None | IPv4 from documentation range `192.0.2.0/24` |

`Authorization` supports `bearer` and `basic`. Bearer uses a random JWT-shaped value, while Basic encodes synthetic credentials as Base64URL

## Counter state and scopes

`Counter` returns `current + Step` and saves the result only when a request is sent. Preview and hover evaluation uses `renderPurpose = preview`, so it does not change stored state

| Option | Default | Behavior |
| --- | --- | --- |
| `Scope` | `Folder` | Selects the shared state scope |
| `Counter Name` | `id` | Separates independent sequences |
| `Initial Value` | `0` | Base value and reset marker |
| `Step` | `1` | Increment amount |
| `Prefix` | Empty | Text before the number |
| `Suffix` | Empty | Text after the number |
| `Padding` | `0` | Minimum number length with leading zeroes |

Scopes work as follows

- `Request` keeps a separate sequence for one request
- `Folder` shares one sequence between requests in the same folder
- `Workspace` shares one sequence between requests in the workspace
- `Global` shares one sequence between workspaces in the plugin local storage

For `Folder` and `Workspace`, the plugin reads the collection hierarchy through Insomnia data export. When export data is unavailable, it uses a request-based fallback identifier, which keeps the scope isolated

Changing `Initial Value` resets the saved sequence. For example, with a saved value of `1`, a new `Initial Value` of `255`, and `Step` set to `1`, the next result is `256`

## Project structure

| File | Purpose |
| --- | --- |
| `index.js` | Generator definitions, random value helpers, date formatting, JWT generation, and `Counter` state logic |
| `main.js` | Stable Insomnia entry point |
| `test/index.test.js` | Checks for tag count, value formats, JWTs, and the `Counter` lifecycle |
| `package.json` | Package metadata, version `0.9.2`, and entry point |
| `README.md` | Short overview and quick start |
| `DOCUMENTATION.ru.md` | Full Russian documentation |
| `DOCUMENTATION.en.md` | Full English documentation |

Built-in data sets live at the top of `index.js`. Identifiers, integers, and strings use a cryptographic random source, while coordinates and decimal numbers use `Math.random`. Dates and timestamps are calculated from the current time

## Verification

```text
node test/index.test.js
```

The check confirms the public entry point, all 45 tags, descriptions without periods, main value formats, and `Counter` behavior in `preview` and `send` modes
