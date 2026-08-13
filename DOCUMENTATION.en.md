# Faker Chan for Insomnia

> Русская версия: [DOCUMENTATION.ru.md](DOCUMENTATION.ru.md)

## Purpose

Faker Chan creates synthetic values for API testing directly in Insomnia

Use it to fill URLs, query parameters, headers, request bodies, and authentication fields without typing values by hand

## Add a value

1. Place the cursor in the required request field
2. Press `Ctrl+Space`
3. Type `FakeC` in Template Tags search
4. Select a tag and configure its options

Tags start with `FakeC -`, for example `FakeC - Identifier UUID`

Tags return values without extra quotation marks

```json
{
  "email": "<FakeC - Contact Email tag>",
  "id": "<FakeC - Identifier - Counter tag>"
}
```

Insomnia inserts the actual tag expression automatically

## Interface language

Insomnia exposes one static `displayName` field to a plugin and does not provide the current interface language

Tag names therefore do not change while the application is running

The neutral `FakeC` prefix is used for search and display

## Generators

| Group | Tags | Options | Example | Limits and notes |
| --- | --- | --- | --- | --- |
| Identifiers | UUID, GUID, Random ID | GUID: `Braces`<br>Random ID: `Length`, `Character Set` | `550e8400-e29b-41d4-a716-446655440000`, `{550e8400-e29b-41d4-a716-446655440000}`, `A7fj29KwP1` | UUID and GUID produce UUID v4 values<br>Random ID defaults to 10 alphanumeric characters |
| Counter | Counter | `Scope`, `Counter Name`, `Initial Value`, `Step`, `Prefix`, `Suffix`, `Padding`, `Increment Mode` | `push-0009-test` | State is kept separately for each name and scope |
| Person | First Name, Last Name, Username | Username: `Strategy` | `Александр`, `Петров`, `alexander.petrov` | First and last names are Russian<br>Username contains ASCII characters only |
| Contact | Email, Phone Number | None | `alex.petrov42@example.com`, `+79161234567` | Email uses `example.com`, `example.org`, or `example.net`<br>Phone numbers follow the `+79XXXXXXXXX` format |
| Location | Country, City, Street, Postal Code, Full Address | None | `Россия`, `Москва`, `Тверская`, `125009` | City, street, and postal code use Russian formats |
| Coordinates | Latitude, Longitude, Coordinates | `Precision` | `55.755826, 37.617300` | Precision ranges from 0 to 12 decimal places |
| Date and time | Current Date, Past Date, Future Date, Unix Timestamp, ISO Timestamp | Dates: `Format`<br>Past Date and Future Date: `Range (days)`<br>Unix Timestamp: `Unit` | `2026-08-13`, `1786635000`, `2026-08-13T13:30:00.000Z` | Dates and ISO timestamps use UTC<br>The default date range is 30 days |
| Numbers | Positive Integer, Negative Integer, Decimal, Percentage, Number in Range | Numbers: `Min`, `Max`<br>Decimal: `Precision`<br>Percentage: `Mode`, `Precision`<br>Number in Range: `Mode` | `42`, `-583`, `583.42` | Percentages always range from 0 to 100<br>Decimal precision ranges from 0 to 12 places |
| Strings | Length 0, 1, 255, 256, 1025, 4096, Custom Length | Custom Length: `Length`, `Character Set` | `QA83aF` | Fixed-length tags produce exactly the configured number of alphanumeric characters |
| Security | Random JWT, Unsigned JWT, Signed JWT (HS256) | Signed JWT: `Secret`, `Payload JSON`, `Expiration (seconds)` | `header.payload.signature` | Use Unsigned JWT only in authorised test scenarios<br>The secret is used only while the tag is evaluated |
| HTTP | User-Agent, Content-Type, Accept, Accept-Language, Authorization, X-Request-ID, X-Correlation-ID, X-Forwarded-For | Authorization: `Scheme` | `application/json`, `Bearer eyJ...`, `192.0.2.15` | `X-Forwarded-For` uses the documentation address range `192.0.2.0/24` |

## Counter

`Counter` creates a sequential identifier and keeps its state

| Option | Default | Purpose |
| --- | --- | --- |
| `Scope` | `Folder` | Selects the storage scope |
| `Counter Name` | `id` | Keeps independent counters separate |
| `Initial Value` | `0` | Sets the value before the first increment |
| `Step` | `1` | Sets the increment amount |
| `Prefix` | Empty | Adds text before the number |
| `Suffix` | Empty | Adds text after the number |
| `Padding` | `0` | Adds leading zeroes up to the selected length |
| `Increment Mode` | `Before Send` | Selects when the next value is saved |

With `Initial Value` = `8` and `Step` = `1`, the first result is `9`

With `Padding` = `4`, values look like `0009`, `0010`, `0011`

Use different `Counter Name` values for independent sequences, for example `push_id`, `campaign_id`, and `message_id`

### Storage scope

- `Request`: a separate value for one request
- `Folder`: one value shared by requests in the same folder
- `Workspace`: one value shared by all requests in the current workspace
- `Global`: one value shared between workspaces in the plugin local storage

For `Folder` and `Workspace`, the plugin determines the current collection structure through Insomnia data export

If collection data is unavailable in Template Tag context, the plugin uses an isolated fallback based on the request ID

### Increment mode

- `Before Send`: saves the next value when the tag is evaluated before sending a request
- `After Successful Response`: saves the next value only after a response with a status from 200 to 299

If the saved value is `8`, the request receives `9`

In `After Successful Response` mode, a `500` response does not change the saved value, so the next request receives `9` again
