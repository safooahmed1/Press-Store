# Platform observability

`createLogger({ environment, sink })` emits structured JSON to stdout by default. The app wires
request logging before API body parsing and records startup outcomes in `startServer`. No external
telemetry service or logging dependency is used.

Only operational metadata is emitted: timestamp, level, environment, event, request ID, declared
route template, method, status, duration in milliseconds and stable error code. Other keys are
discarded. Never put user input in an event name or declared route template. Do not pass messages,
SQL, exceptions, URLs, headers, cookies, bodies, phones or payment values through those fields.
The implementation deliberately provides no arbitrary text/context channel.

```js
const logger = createLogger({ environment: config.nodeEnv })
logger.log('application.started')
logger.log('application.startup.failed', { level: 'error', errorCode: 'STARTUP_FAILED' })
```

HTTP responses retain HTTP-FND-001. The response header and envelope carry the same server-generated
request ID found in logs. A disconnect logs `http.request.aborted`, operational status 499 and
`REQUEST_ABORTED` once; it does not attempt another response. Unknown paths use `<unmatched>`.
When Express unwinds an error or uses nested mounts and the complete declared template cannot be
established safely, the template is `<unresolved>`; resolved URLs are never used as a fallback.
Synchronous and asynchronous sink failure does not change HTTP/startup behavior.

Retention/rotation must be established against Hostinger capabilities before production (FND-006).
Business event emission and owner-specific audit context remain with AUTH/ORD and other owners.
No business action, scheduler, migration behavior or audit persistence is implemented here.
