# Faker Chan для Insomnia

> English version: [DOCUMENTATION.en.md](DOCUMENTATION.en.md)

## Назначение

Faker Chan создаёт синтетические значения для проверки API прямо в Insomnia

Используйте его, чтобы заполнить URL, query-параметры, заголовки, тело запроса или поля аутентификации без ручного ввода

## Как добавить значение

1. Поставьте курсор в нужное поле запроса
2. Нажмите `Ctrl+Space`
3. Введите `FakeC` в поиске Template Tags
4. Выберите тег и настройте его параметры

Теги начинаются с `FakeC -`, например `FakeC - Identifier UUID`

Тег возвращает значение без дополнительных кавычек

```json
{
  "email": "<тег FakeC - Contact Email>",
  "id": "<тег FakeC - Identifier - Counter>"
}
```

Insomnia вставляет фактическое выражение тега автоматически

## Язык интерфейса

Insomnia передаёт плагину одно статическое поле `displayName` и не сообщает текущий язык интерфейса

Поэтому названия тегов не меняются во время работы приложения

Для поиска и отображения используется нейтральный префикс `FakeC`

## Генераторы

| Группа | Теги | Параметры | Пример | Ограничения и особенности |
| --- | --- | --- | --- | --- |
| Идентификаторы | UUID, GUID, Random ID | У GUID: `Braces`<br>У Random ID: `Length`, `Character Set` | `550e8400-e29b-41d4-a716-446655440000`, `{550e8400-e29b-41d4-a716-446655440000}`, `A7fj29KwP1` | UUID и GUID создают UUID v4<br>Random ID по умолчанию содержит 10 буквенно-цифровых символов |
| Счётчик | Counter | `Scope`, `Counter Name`, `Initial Value`, `Step`, `Prefix`, `Suffix`, `Padding`, `Increment Mode` | `push-0009-test` | Состояние сохраняется отдельно для каждого имени и области |
| Пользователь | First Name, Last Name, Username | У Username: `Strategy` | `Александр`, `Петров`, `alexander.petrov` | Имена и фамилии русские<br>Username содержит только ASCII-символы |
| Контакты | Email, Phone Number | Нет | `alex.petrov42@example.com`, `+79161234567` | Email использует `example.com`, `example.org` или `example.net`<br>Телефон имеет формат `+79XXXXXXXXX` |
| Адрес | Country, City, Street, Postal Code, Full Address | Нет | `Россия`, `Москва`, `Тверская`, `125009` | Город, улица и индекс соответствуют российскому формату |
| Координаты | Latitude, Longitude, Coordinates | `Precision` | `55.755826, 37.617300` | Точность от 0 до 12 знаков после запятой |
| Дата и время | Current Date, Past Date, Future Date, Unix Timestamp, ISO Timestamp | У дат: `Format`<br>У Past Date и Future Date: `Range (days)`<br>У Unix Timestamp: `Unit` | `2026-08-13`, `1786635000`, `2026-08-13T13:30:00.000Z` | Даты и ISO-время используют UTC<br>Диапазон дат по умолчанию равен 30 дням |
| Числа | Positive Integer, Negative Integer, Decimal, Percentage, Number in Range | У чисел: `Min`, `Max`<br>У Decimal: `Precision`<br>У Percentage: `Mode`, `Precision`<br>У Number in Range: `Mode` | `42`, `-583`, `583.42` | Процент всегда находится в диапазоне от 0 до 100<br>Точность дробных чисел от 0 до 12 знаков |
| Строки | Length 0, 1, 255, 256, 1025, 4096, Custom Length | У Custom Length: `Length`, `Character Set` | `QA83aF` | Теги фиксированной длины создают ровно указанное число буквенно-цифровых символов |
| Безопасность | Random JWT, Unsigned JWT, Signed JWT (HS256) | У Signed JWT: `Secret`, `Payload JSON`, `Expiration (seconds)` | `header.payload.signature` | Используйте Unsigned JWT только в разрешённых тестовых сценариях<br>Secret применяется только во время вычисления тега |
| HTTP | User-Agent, Content-Type, Accept, Accept-Language, Authorization, X-Request-ID, X-Correlation-ID, X-Forwarded-For | У Authorization: `Scheme` | `application/json`, `Bearer eyJ...`, `192.0.2.15` | `X-Forwarded-For` использует диапазон адресов для документации `192.0.2.0/24` |

## Счётчик

`Counter` создаёт последовательный идентификатор и хранит его состояние

| Параметр | По умолчанию | Назначение |
| --- | --- | --- |
| `Scope` | `Folder` | Выбирает область хранения |
| `Counter Name` | `id` | Разделяет независимые счётчики |
| `Initial Value` | `0` | Задаёт значение до первого увеличения |
| `Step` | `1` | Задаёт величину увеличения |
| `Prefix` | Пусто | Добавляет текст перед числом |
| `Suffix` | Пусто | Добавляет текст после числа |
| `Padding` | `0` | Добавляет ведущие нули до заданной длины |
| `Increment Mode` | `Before Send` | Определяет момент сохранения следующего значения |

При `Initial Value` = `8` и `Step` = `1` первый результат равен `9`

При `Padding` = `4` значения выглядят так: `0009`, `0010`, `0011`

Несколько последовательностей можно вести с помощью разных значений `Counter Name`, например `push_id`, `campaign_id` и `message_id`

### Область хранения

- `Request`: отдельное значение для конкретного запроса
- `Folder`: общее значение для запросов в одной папке
- `Workspace`: общее значение для всех запросов текущей рабочей области
- `Global`: общее значение для рабочих областей в локальном хранилище плагина

Для `Folder` и `Workspace` плагин определяет структуру текущей коллекции через экспорт данных Insomnia

Если данные коллекции недоступны в контексте Template Tag, применяется изолированная запасная область по ID запроса

### Режим увеличения

- `Before Send`: следующее значение сохраняется при вычислении тега перед отправкой запроса
- `After Successful Response`: следующее значение сохраняется только после ответа со статусом от 200 до 299

Если сохранённое значение равно `8`, запрос получает `9`

В режиме `After Successful Response` ответ `500` не изменяет сохранённое значение, поэтому следующий запрос снова получает `9`
