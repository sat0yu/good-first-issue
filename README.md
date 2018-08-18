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
yarn deploy
```

## stack
- [google/clasp](https://github.com/google/clasp)
- [webpack](https://webpack.js.org/)
- [TypeScript](http://www.typescriptlang.org/)
- [TSLint](https://palantir.github.io/tslint/)
