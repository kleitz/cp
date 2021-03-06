# getting started

the following targes are available: `test-e2e`, `test-integration`,
`test-unit`, and `test` which triggers the last two. the e2e tests require that
webdriver be runnig which can be done with `make test-start-webdriver`.

```bash
# runs unit and integration tests
make test
```

```bash
# runs e2e tests
make test-start-webdriver
make test-e2e
```

the following environment variables are required to put parts of the
application in "test" mode and allow additional authentication and database
methods (eg. api key logins, hard-deleteds, etc. a lot of tests will not work
without these features enabled) and point to an instance:

```bash
export CP_ALLOW_APIKEY_AUTH=1
export CP_PURGE_KEY='...'
export CP_TEST_INSTANCE_URL=http://localhost:3000
```

# structure

- `e2e` is for end-to-end tests building using protractor (so angular stuff)
- `extract` is for integration tests for external services (will need internet)
- `integration` is for integration tests for internal services (won't need internet)
- `src` is for unit tests
