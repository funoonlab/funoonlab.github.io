# Testing

Run the clean static build and validator:

```sh
npm run build
npm run validate
```

Local browser check:

```sh
python -m http.server 8080
```

Open `http://localhost:8080/` and check:

- Home, contact, news, project category, project detail, policy, and article routes.
- Mobile navigation toggle.
- Static search form.
- Contact form static confirmation message.
- Browser console and network panel.

The generated HTML should only load the shared stylesheet, shared script, referenced media, and Google Analytics.
