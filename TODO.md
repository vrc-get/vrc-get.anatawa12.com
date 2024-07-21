# ToDo

- [X] Landing Page
- [X] Setup DevContainer
- [ ] CLI Page
- [ ] ALCOM Page
- [ ] Automatic localization redirect
- [ ] Japanese Translations
- [ ] German Translations

## Optionals (check back with @anatawa12)

- [ ] API endpoint (`/src/api/unity.json`) for unity versions *(most recent and supported)*
- [ ] API endpoint (`/src/api/messages.json`) for system messages *(array of objects with message & type)*

### Messages API Endpoint

```json
[
    {
        "id": 0, // arbitrary id
        "for": "universal", // universal, gui, cli
        "from": null, // null or unix-timestamp (string)
        "until": null, // null or unix-timestamp (string)
        "show": "once", // once, per-session, constant, updatable
        "interval": 0, // seconds between updates; only valid if `show` is `updatable`
        "type": "info", // info, warning, critical
        "message": "This is a test" // message to display
    }
]
```
