# ToDo

- [X] Landing Page
- [X] Setup DevContainer
- [X] CLI Page
- [ ] CLI Documentation
- [X] ALCOM Page
- [X] Disable downloads for Android & iOS
- [X] Automatic localization redirect
- [ ] Japanese Translations
- [ ] German Translations
- [X] Figure out what the third Unity versions is that the VRChat SDK supports

## Optionals (check back with @anatawa12)

- [ ] API endpoint (`/public/api/messages.json`) for system messages *(array of objects with message & type)*

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
