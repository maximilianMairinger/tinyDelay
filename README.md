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

Change timeout duration. For doc on Data see: https://github.com/maximilianMairinger/josm#data
  
```ts
import { Data } from "josm"

const timeoutDuration = new Data(1000)
const timeout = delay(timeoutDuration, () => {
  console.log("2 seconds passed")
})

delay(500, () => {
  timeoutDuration.set(2000)
})
```

### Additional Functions

#### isIdle

```ts
import { isIdle } from "tiny-delay"

const msWhenToCallItIdle = 500
const { idle, f: notIdle } = isIdle(msWhenToCallItIdle)

element.on("scroll", notIdle)

// idle is a Data<boolean> that is true when the element has not been scrolled for msWhenToCallItIdle milliseconds. See https://github.com/maximilianMairinger/josm#data
idle.get((idle) => {
  console.log(idle)
})
```

#### absoluteToDeltaTime

```ts
import { absoluteToDeltaTime } from "tiny-delay"

const absoluteTime = Date.now() + 1000
const deltaTimeRightNow = absoluteToDeltaTime(absoluteTime) // = 1000

// may be chained to delay
delay(deltaTimeRightNow, () => {
  console.log("1 second passed")
})

// A Data instance can also be given.
```

#### decomposedAbsoluteToDeltaTime

Basically just a wrapper over absoluteToDeltaTime, but decomposed into duration and start time. Both can be instance of Data.

A potential use case would be a login session that has a starting time and a duration, which can be reconstructed when the server restarts. 

```ts
import { decomposedAbsoluteToDeltaTime } from "tiny-delay"

const durationTime = 1000
const startingTime = Date.now() - 500
const deltaTimeRightNow = decomposedAbsoluteToDeltaTime(absoluteTime, startingTime)

// may be chained to delay
delay(deltaTimeRightNow, () => {
  console.log(".5 second passed from now, 1 second from .5 seconds ago")
})
```




## Contribute

All feedback is appreciated. Create a pull request or write an issue.
