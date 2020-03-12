import { Data } from "./dataTemp"

export abstract class TimeUnit extends Data<number> {
  constructor(time: number) {
    super(undefined)
    this.set(this.toMs(time))
  }
  public abstract toMs(time: number): number
}

export class Second extends TimeUnit {
  constructor(time: number) {
    super(time)
  }
  public toMs(time: number): number {
    return time / 1000
  }
}





export function delay(ms_timeUnit: number | TimeUnit) {
  if (ms_timeUnit instanceof TimeUnit) {

  }

  setTimeout(() => {

  })
}

export function interval() {

}

export default delay
export const timeout = delay
