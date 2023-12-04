import { Data } from "josm"
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


export function isIdle(timeoutMs: number = 500) {
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