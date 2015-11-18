## services

### monitoring

#### newrelic

follow
[newrelic's installation instructions](https://elements.heroku.com/addons/newrelic#wayne)
and make sure to never hardcode app names or store license keys in code:

```bash
heroku config:set NEWRELIC_KEY=$(echo $NEWRELIC_KEY)
heroku config:set NEWRELIC_APP_NAME=$(echo $NEWRELIC_APP_NAME)
heroku config:set NEWRELIC_LOG_LEVEL='info'
```