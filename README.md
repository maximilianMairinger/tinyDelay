# Tiny delay

Changeable and cancelable promise based delay / setTimeout implementation.


## Example

Simple promise / callback based usage

```ts
import delay from "tiny-delay"

delay(1000).then(() => {
  console.log("1 second passed")
})

delay(1000, () => {
  console.log("1 second passed")
})
```

Cancel anytime

```ts
const timeout = tinyDelay(1000)

delay(500, () => {
  timeout.cancel()
})
```

Change timout duration

  
```ts
import { Data } from "josm"

const timoutDuration = new Data(1000)
const timeout = delay(timeoutDuration, () => {
  console.log("2 seconds passed")
})

delay(500, () => {
  timeoutDuration.set(2000)
})
```

## Conribute

All feedback is appreciated. Create a pull request or write an issue.
