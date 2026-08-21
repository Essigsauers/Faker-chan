# Faker Chan для Insomnia

> English version: [DOCUMENTATION.en.md](DOCUMENTATION.en.md)

Faker Chan — плагин Insomnia для генерации синтетических значений во время подготовки HTTP-запроса

## Быстрый старт

1. Откройте URL, query-параметр, заголовок, тело запроса или поле авторизации
2. Нажмите `Ctrl+Space` и откройте список Template Tags
3. Найдите тег по префиксу `FakeC`
4. Выберите тег и заполните параметры, если они есть

Insomnia вставляет выражение тега в выбранное поле, а его результат получает запрос при рендеринге

```json
{
  "email": "<FakeC - Contact Email>",
  "requestId": "<FakeC - Identifier UUID>",
  "createdAt": "<FakeC - Date & Time ISO Timestamp>"
}
```

Теги возвращают готовые значения без дополнительных кавычек, поэтому в JSON выражение размещается внутри строкового значения, а тип результата определяется самим полем запроса

## Как устроены теги

Каждый тег экспортируется из `index.js` как объект с пятью основными свойствами

| Свойство | Назначение |
| --- | --- |
| `name` | Внутреннее имя, которое использует Insomnia при вычислении |
| `displayName` | Название в списке Template Tags с префиксом `FakeC` |
| `description` | Короткое описание в интерфейсе Insomnia |
| `args` | Параметры, их типы, значения по умолчанию и варианты выбора |
| `run` | Функция, возвращающая значение тега |

`main.js` остаётся стабильной точкой входа и передаёт Insomnia тот же массив `templateTags`

Названия тегов не локализуются во время работы приложения: API плагинов Insomnia предоставляет статическое поле `displayName` и не сообщает текущий язык интерфейса. Поэтому для поиска используется единый префикс `FakeC`, а названия категорий и параметры остаются на английском

Описания в списке Insomnia выводятся без точек в конце, чтобы элементы списка имели единый вид

## Каталог генераторов

В проекте 45 тегов, объединённых в 9 групп

### Идентификаторы

| Отображаемое имя | Внутреннее имя | Параметры | Результат |
| --- | --- | --- | --- |
| `FakeC - Identifier UUID` | `fakerUuid` | Нет | UUID v4 |
| `FakeC - Identifier GUID` | `fakerGuid` | `Braces`: `false` | UUID v4, при `true` обёрнутый в `{}` |
| `FakeC - Identifier Random ID` | `fakerRandomId` | `Length`: `10`, `Character Set`: `alphanumeric` | Строка из букв и цифр |
| `FakeC - Identifier Counter` | `fakerCounter` | `Scope`: `folder`, `Counter Name`: `id`, `Initial Value`: `0`, `Step`: `1`, `Prefix`: пусто, `Suffix`: пусто, `Padding`: `0` | Последовательное число с форматированием |

Для `Random ID` доступны наборы `digits`, `letters`, `alphanumeric`, `lowercase` и `uppercase`

### Персональные и контактные данные

| Отображаемое имя | Внутреннее имя | Параметры | Результат |
| --- | --- | --- | --- |
| `FakeC - Person First Name` | `fakerFirstName` | Нет | Русское имя из встроенного набора |
| `FakeC - Person Last Name` | `fakerLastName` | Нет | Русская фамилия из встроенного набора |
| `FakeC - Person Username` | `fakerUsername` | `Strategy`: `name-dot-last` | ASCII-логин |
| `FakeC - Contact Email` | `fakerEmail` | Нет | Адрес на `example.com`, `example.org` или `example.net` |
| `FakeC - Contact Phone Number` | `fakerPhoneRu` | Нет | Российский мобильный номер формата `+79XXXXXXXXX` |

Для `Username` доступны стратегии `random`, `name-dot-last`, `last-number` и `user-number`

### Адреса и координаты

| Отображаемое имя | Внутреннее имя | Параметры | Результат |
| --- | --- | --- | --- |
| `FakeC - Location Country` | `fakerCountry` | Нет | `Россия` |
| `FakeC - Location City` | `fakerCity` | Нет | Российский город из встроенного набора |
| `FakeC - Location Street` | `fakerStreet` | Нет | Название улицы из встроенного набора |
| `FakeC - Location Postal Code` | `fakerPostalCode` | Нет | Шесть цифр |
| `FakeC - Location Full Address` | `fakerFullAddress` | Нет | Город, улица и номер дома |
| `FakeC - Location Latitude` | `fakerLatitude` | `Precision`: `6` | Широта от `-90` до `90` |
| `FakeC - Location Longitude` | `fakerLongitude` | `Precision`: `6` | Долгота от `-180` до `180` |
| `FakeC - Location Coordinates` | `fakerCoordinates` | `Precision`: `6` | Широта и долгота через `, ` |

`Precision` ограничивается диапазоном от 0 до 12 знаков после запятой

### Дата и время

| Отображаемое имя | Внутреннее имя | Параметры | Результат |
| --- | --- | --- | --- |
| `FakeC - Date & Time Current Date` | `fakerCurrentDate` | `Format`: `YYYY-MM-DD` | Текущая дата по UTC |
| `FakeC - Date & Time Past Date` | `fakerPastDate` | `Range (days)`: `30`, `Format`: `YYYY-MM-DD` | Дата от 1 до указанного числа дней назад |
| `FakeC - Date & Time Future Date` | `fakerFutureDate` | `Range (days)`: `30`, `Format`: `YYYY-MM-DD` | Дата от 1 до указанного числа дней вперёд |
| `FakeC - Date & Time Unix Timestamp` | `fakerUnixTimestamp` | `Unit`: `seconds` | Unix-время в секундах или миллисекундах |
| `FakeC - Date & Time ISO Timestamp` | `fakerIsoTimestamp` | Нет | Текущая дата в ISO 8601 по UTC |

Для форматирования даты используются токены `YYYY`, `MM` и `DD`. Диапазон `Range (days)` ограничивается значениями от 1 до 36500

### Числа

| Отображаемое имя | Внутреннее имя | Параметры по умолчанию | Результат |
| --- | --- | --- | --- |
| `FakeC - Number Positive Integer` | `fakerPositiveInteger` | `Min`: `1`, `Max`: `1000` | Положительное целое число |
| `FakeC - Number Negative Integer` | `fakerNegativeInteger` | `Min`: `-1000`, `Max`: `-1` | Отрицательное целое число |
| `FakeC - Number Decimal` | `fakerDecimal` | `Min`: `0`, `Max`: `1000`, `Precision`: `2` | Дробное число с фиксированной точностью |
| `FakeC - Number Percentage` | `fakerPercentage` | `Mode`: `integer`, `Precision`: `2` | Значение от 0 до 100 |
| `FakeC - Number Number in Range` | `fakerNumberRange` | `Min`: `0`, `Max`: `100`, `Mode`: `integer` | Целое или дробное число в диапазоне |

Точность дробных значений ограничивается диапазоном от 0 до 12 знаков. Если минимальное значение больше максимального, границы меняются местами

### Строки

| Отображаемое имя | Внутреннее имя | Параметры | Результат |
| --- | --- | --- | --- |
| `FakeC - String Length 0` | `fakerString0` | Нет | Пустая строка |
| `FakeC - String Length 1` | `fakerString1` | Нет | 1 буквенно-цифровой символ |
| `FakeC - String Length 255` | `fakerString255` | Нет | 255 буквенно-цифровых символов |
| `FakeC - String Length 256` | `fakerString256` | Нет | 256 буквенно-цифровых символов |
| `FakeC - String Length 1025` | `fakerString1025` | Нет | 1025 буквенно-цифровых символов |
| `FakeC - String Length 4096` | `fakerString4096` | Нет | 4096 буквенно-цифровых символов |
| `FakeC - String Custom Length` | `fakerCustomString` | `Length`: `16`, `Character Set`: `alphanumeric` | Строка длиной от 0 до 100000 символов |

Для `Custom Length` доступны наборы `latin`, `numeric` и `alphanumeric`

### JWT и безопасность

| Отображаемое имя | Внутреннее имя | Параметры | Результат |
| --- | --- | --- | --- |
| `FakeC - Security Random JWT` | `fakerRandomJwt` | Нет | Синтетическое значение из трёх JWT-сегментов |
| `FakeC - Security Unsigned JWT` | `fakerUnsignedJwt` | Нет | JWT с `alg: none` и пустой подписью |
| `FakeC - Security Signed JWT (HS256)` | `fakerSignedJwtHs256` | `Secret`: `test-secret`, `Payload JSON`: `{"sub":"1234567890"}`, `Expiration (seconds)`: `3600` | JWT с подписью HMAC-SHA256 |

Эти теги предназначены для тестовых данных. `Unsigned JWT` не подтверждает подлинность и подходит только для разрешённых негативных сценариев. Секрет `Signed JWT` используется только в памяти во время вычисления и не сохраняется плагином

Некорректный JSON в `Payload JSON` заменяется телом `{"sub":"1234567890"}`. Срок действия ограничивается значениями от 1 до 31536000 секунд

### HTTP

| Отображаемое имя | Внутреннее имя | Параметры | Результат |
| --- | --- | --- | --- |
| `FakeC - HTTP User-Agent` | `fakerUserAgent` | Нет | User-Agent Chrome, Safari или Linux-браузера |
| `FakeC - HTTP Content-Type` | `fakerContentType` | Нет | Один из распространённых Content-Type |
| `FakeC - HTTP Accept` | `fakerAccept` | Нет | Один из распространённых Accept |
| `FakeC - HTTP Accept-Language` | `fakerAcceptLanguage` | Нет | `ru-RU`, `en-US` или `de-DE` |
| `FakeC - HTTP Authorization` | `fakerAuthorization` | `Scheme`: `bearer` | Bearer или Basic авторизация |
| `FakeC - HTTP X-Request-ID` | `fakerXRequestId` | Нет | UUID v4 |
| `FakeC - HTTP X-Correlation-ID` | `fakerXCorrelationId` | Нет | UUID v4 |
| `FakeC - HTTP X-Forwarded-For` | `fakerXForwardedFor` | Нет | IPv4 из диапазона документации `192.0.2.0/24` |

Для `Authorization` доступны схемы `bearer` и `basic`. Bearer использует случайное JWT-подобное значение, Basic кодирует синтетические учётные данные в Base64URL

## Counter: состояние и области

`Counter` возвращает `current + Step`, а результат сохраняет только при отправке запроса. При просмотре значения и наведении на тег используется режим `preview`, поэтому состояние не изменяется

| Параметр | По умолчанию | Поведение |
| --- | --- | --- |
| `Scope` | `Folder` | Выбирает область общего состояния |
| `Counter Name` | `id` | Разделяет независимые последовательности |
| `Initial Value` | `0` | Базовое значение и признак сброса последовательности |
| `Step` | `1` | Величина увеличения |
| `Prefix` | Пусто | Текст перед числом |
| `Suffix` | Пусто | Текст после числа |
| `Padding` | `0` | Минимальная длина числа с ведущими нулями |

Область определяется так

- `Request` хранит отдельную последовательность для одного запроса
- `Folder` делит последовательность между запросами одной папки
- `Workspace` делит последовательность между запросами рабочей области
- `Global` делит последовательность между рабочими областями в локальном хранилище плагина

Для `Folder` и `Workspace` плагин получает иерархию коллекции через экспорт данных Insomnia. Если экспорт недоступен, используется запасной идентификатор на основе запроса, поэтому область остаётся изолированной

Изменение `Initial Value` сбрасывает сохранённую последовательность. Например, при сохранённом значении `1`, новом `Initial Value` `255` и `Step` `1` следующий результат равен `256`

## Структура проекта

| Файл | Назначение |
| --- | --- |
| `index.js` | Данные генераторов, общие функции случайных значений, форматирование дат, JWT и логика `Counter` |
| `main.js` | Стабильная точка входа Insomnia |
| `test/index.test.js` | Проверки количества тегов, форматов значений, JWT и жизненного цикла `Counter` |
| `package.json` | Метаданные пакета, версия `0.9.2` и точка входа |
| `README.md` | Короткое описание и быстрый старт |
| `DOCUMENTATION.ru.md` | Полная документация на русском языке |
| `DOCUMENTATION.en.md` | Полная документация на английском языке |

Все встроенные наборы данных находятся в начале `index.js`. Идентификаторы, целые числа и строки используют криптографический источник случайности, а координаты и дробные числа вычисляются через `Math.random`. Даты и временные метки зависят от текущего времени

## Проверка проекта

```text
node test/index.test.js
```

Проверка подтверждает публичную точку входа, наличие 45 тегов, отсутствие точек в описаниях, форматы основных значений и поведение `Counter` в режимах `preview` и `send`
