import { Data, DataCollection } from "josm"
import { setTimeout, clearTimeout, Timeout } from "long-timeout"
import { CancelAblePromise } from "more-proms"
export { CancelAblePromise } from "more-proms"



export const now = Date.now.bind(Date)


export function delay(ms: number | Data<number>, done?: () => void) {
  let cancelFunc: Function
  const prom = new CancelAblePromise<void>((res) => {
    if (!done) done = res
    else {
      const oldDone = done
      done = () => {
        oldDone()
        res()
      }
    }


    if (typeof ms !== "number") {
      const startTime = now()
      let timeout: Timeout

      function setNewTimeout(ms: number) {
        const timeDelta = now() - startTime
        timeout = setTimeout(done, ms - timeDelta)
      }

      const sub = ms.get((ms) => {
        clearTimeout(timeout)
        setNewTimeout(ms)
      }, false)

      setNewTimeout(ms.get())

      cancelFunc = () => {
        sub.deactivate()
        clearTimeout(timeout)
      }
    }
    else {
      const timeout = setTimeout(done, ms)
      cancelFunc = () => {
        clearTimeout(timeout)
      }
    }
  }, () => {
    cancelFunc()
    return true
  })
  

  return prom
}


export default delay
export const timeout = delay


export function isIdle(timeoutMs: number | Data<number> = 500) {
  const idle = new Data(false)
  let lastDelay = delay(timeoutMs)
  function f() {
    idle.set(false)
    lastDelay.cancel()
    lastDelay = delay(timeoutMs).then(() => {
      idle.set(true)
    })

  }
  return { idle, f }
}


export function absoluteToDeltaTime(absTimeMs: number): number
export function absoluteToDeltaTime(absTimeMs: Data<number>): Data<number>
export function absoluteToDeltaTime(absTimeMs: number | Data<number>) {
  const isTypeofNumber = typeof absTimeMs === "number"
  const absTime = isTypeofNumber ? new Data(absTimeMs) : absTimeMs
  const time = absTime.tunnel((absTime) => absTime - now())
  return isTypeofNumber ? time.get() : time
}


export function decomposedAbsoluteToDeltaTime(durationTimeMs: number, startingTimeMs?: number): number
export function decomposedAbsoluteToDeltaTime(durationTimeMs: number | Data<number>, startingTimeMs?: number | Data<number>): Data<number>
export function decomposedAbsoluteToDeltaTime(durationTimeMs: number | Data<number>, startingTimeMs?: number | Data<number>) {
  const isDurationTimeTypeofNumber = typeof durationTimeMs === "number"
  const isStartingTimeTypeofNumber = typeof startingTimeMs === "number"
  const durationTime = isDurationTimeTypeofNumber ? new Data(durationTimeMs) : durationTimeMs
  const startingTime = isStartingTimeTypeofNumber ? new Data(startingTimeMs) : startingTimeMs

  const absTime = new Data<number>()
  new DataCollection(durationTime, startingTime).get((duration, beginTime) => {
    absTime.set(beginTime + duration)
  })

  const time = absoluteToDeltaTime(absTime)

  return isDurationTimeTypeofNumber && isStartingTimeTypeofNumber ? time.get() : time
}

