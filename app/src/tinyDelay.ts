import { Data } from "josm"
import { setTimeout, clearTimeout, Timeout } from "long-timeout"

export const now = Date.now.bind(Date)

type SuccessfullyRemoved = boolean

export class CancelAblePromise extends Promise<void> {
  constructor(f: (resolve: (value?: void | PromiseLike<void>) => void, reject: (reason?: any) => void) => void, public cancel: () => SuccessfullyRemoved) {
    super(f)
  }
}

export function delay(ms: number | Data<number>, done?: () => void) {
  let cancelFunc: Function
  const prom = new CancelAblePromise((res) => {
    if (!done) done = res
    else {
      const oldDone = done
      done = () => {
        oldDone()
        res()
      }
    }


    // todo: check without using Data. No need to import everything
    if (ms instanceof Data) {
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
  }, undefined)

  prom.cancel = () => {
    cancelFunc()
    prom.cancel = () => false
    return true
  }
  

  return prom
}


export default delay
export const timeout = delay
