# good-first-issue
## setup
### prepare `.clasp.json`
```json
{
  "scriptId": <YOUR_SCRIPT_ID>,
  "rootDir": "dist"
}
```

### clone
```sh
yarn
yarn clasp login // enable Google Apps Script API
yarn clasp clone <YOUR_PROJECT_ID>
```

## deploy
```sh
yarn clasp push
```
