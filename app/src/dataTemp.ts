import Xrray from "xrray"
Xrray(Array)

export type Subscription<Values extends any[]> = (...value: Values) => void | Promise<void>


export class Data<Value> {
  private value: Value
  private subscriptions: Subscription<[Value]>[] = []

  public constructor(value?: Value) {
    this.value = value
  }

  
  public get(): Value
  public get(subscription: Subscription<[Value]>, initialize?: boolean): DataSubscription<[Value]>
  public get(subscription: DataSubscription<[Value]>, initialize?: boolean): DataSubscription<[Value]>
  public get(subscription?: Subscription<[Value]> | DataSubscription<[Value]>, initialize: boolean = true): Value | DataSubscription<[Value]> {
    if (subscription === undefined) return this.value
    else {
      if (subscription instanceof DataSubscription) return subscription.activate(initialize)
      else return new DataSubscription(this as any as {subscribe: (subscription: Subscription<[Value]>, initialize?: boolean) => void, unsubscribe: (subscription: Subscription<[Value]>) => void, get: () => [Value], isSubscribed: (subscription: Subscription<[Value]>) => boolean}, subscription, true, initialize)
    }
  }

  private isSubscribed(subscription: Subscription<[Value]>) {
    return this.subscriptions.includes(subscription)
  }
  private unsubscribe(subscription: Subscription<[Value]>) {
    this.subscriptions.rmV(subscription)
  }
  private subscribe(subscription: Subscription<[Value]>, initialize: boolean) {
    this.subscriptions.add(subscription)
    //@ts-ignore
    if (initialize) return subscription(this.value)
  }

  // TODO return true when successfull
  public got(subscription: Subscription<[Value]> | DataSubscription<[Value]>): DataSubscription<[Value]> {
    return (subscription instanceof DataSubscription) ? subscription.deacivate()
    : new DataSubscription(this as any as {subscribe: (subscription: Subscription<[Value]>, initialize?: boolean) => void, unsubscribe: (subscription: Subscription<[Value]>) => void, get: () => [Value], isSubscribed: (subscription: Subscription<[Value]>) => boolean}, subscription, false)
  }

  private destroy() {
    for (const key in this) {
      delete this[key]
    }
  }

  public set(value: Value): Value
  public set(value: Value, wait: false): Value
  public set(value: Value, wait: true): Promise<Value>
  public set(value: Value, wait: boolean = false): Value | Promise<Value> {
    if (value === this.value) return value
    this.value = value
    if (!wait) {
      for (let subscription of this.subscriptions) {
        subscription(value)
      }
      return value
    }
    else {
      return (async () => {
        for (let subscription of this.subscriptions) {
          await subscription(value)
        }
        return value
      })()
    }
  }

  public toString() {
    return "Data: " + this.value
  }
}



export type DataSet<Values extends any[]> = Data<Values[0]> | DataCollection<Values>

type DataSetify<T extends any[]> = { 
  [P in keyof T]: DataSet<[T[P]]>
}


export class DataCollection<Values extends any[], Value extends Values[number] = Values[number]> {
  private subscriptions: Subscription<Values>[] = []
  //@ts-ignore
  private datas: DataSetify<Values> = []
  private store: Values

  private observers: Subscription<[Value]>[] = []

  constructor(...datas: DataSetify<Values>) {
    //@ts-ignore
    this.set(...datas)
  }

  public set(...datas: DataSetify<Values>) {
    this.datas.ea((data, i) => {
      data.got(this.observers[i])
    })
    this.observers.clear()

    this.datas = datas
    //@ts-ignore
    this.store = [...this.get()]


    this.datas.ea((data, i) => {
      const observer = (val: Value) => {
        this.store[i] = val
        this.subscriptions.Call(...this.store)
      }
      this.observers[i] = observer
      //@ts-ignore
      data.subscribe(observer, false)
    })
  }

  // Gets called from DataSubscription
  private isSubscribed(subscription: Subscription<Values>) {
    return this.subscriptions.includes(subscription)
  }

  // Gets called from DataSubscription
  private subscribe(subscription: Subscription<Values>, initialize: boolean) {
    this.subscriptions.add(subscription)
    if (initialize) subscription(...this.store)
  }

  private unsubscribe(subscription: Subscription<Values>) {
    this.subscriptions.rmV(subscription)
  }

  public get(): Values
  public get(subscription: Subscription<Values> | DataSubscription<Values>, initialize?: boolean): DataSubscription<Values>
  public get(subscription?: Subscription<Values> | DataSubscription<Values>, initialize: boolean = true): DataSubscription<Values> | Values {
    //@ts-ignore
    if (subscription === undefined) return this.datas.Inner("get", [])
    else {
      if (subscription instanceof DataSubscription) return subscription.activate(initialize)
      else return new DataSubscription(this as any as {subscribe: (subscription: Subscription<Values>, initialize?: boolean) => void, unsubscribe: (subscription: Subscription<Values>) => void, get: () => Values, isSubscribed: (subscription: Subscription<Values>) => boolean}, subscription, true, initialize)
    }
  }
  public got(subscription: Subscription<Values> | DataSubscription<Values>): DataSubscription<Values> {
    return (subscription instanceof DataSubscription) ? subscription.deacivate()
    : new DataSubscription(this as any as {subscribe: (subscription: Subscription<Values>, initialize?: boolean) => void, unsubscribe: (subscription: Subscription<Values>) => void, get: () => Values, isSubscribed: (subscription: Subscription<Values>) => boolean}, subscription, false)
  }

} 


type Subscribable<Values extends any[]> = {subscribe: (subscription: Subscription<Values>, initialize?: boolean) => void, unsubscribe: (subscription: Subscription<Values>) => void, get: () => Values, isSubscribed: (subscription: Subscription<Values>) => boolean}

export class DataSubscription<Values extends Value[], TupleValue extends [Value] = [Values[number]], Value = TupleValue[0], ConcreteData extends Subscribable<Values> = Subscribable<Values>, ConcreteSubscription extends Subscription<Values> = Subscription<Values>> {

  private _subscription: ConcreteSubscription
  private _data: ConcreteData

  constructor(data: Subscribable<Values>, subscription: Subscription<Values>, activate?: false)
  constructor(data: Subscribable<Values>, subscription: Subscription<Values>, activate?: true, inititalize?: boolean)

  constructor(data: Data<Value>, subscription: Subscription<TupleValue>, activate?: false)
  constructor(data: Data<Value>, subscription: Subscription<TupleValue>, activate?: true, inititalize?: boolean)

  constructor(data: DataCollection<Values>, subscription: Subscription<Values>, activate?: false)
  constructor(data: DataCollection<Values>, subscription: Subscription<Values>, activate?: true, inititalize?: boolean)
  constructor(data: Subscribable<Values> | Data<Value> | DataCollection<Values>, _subscription: Subscription<Values> | Subscription<[Values[0]]>, activate: boolean = true, inititalize: boolean = true) {
    //@ts-ignore
    this._data = data
    //@ts-ignore
    this._subscription = _subscription
    this.active(activate, inititalize)
  }

  public activate(initialize: boolean = true): this {  
    if (this.active()) return this
    this._data.subscribe(this._subscription, initialize)
    return this
  }

  public deacivate(): this {
    if (!this.active()) return this
    this._data.unsubscribe(this._subscription)
    return this
  }

  public active(): boolean
  public active(activate: false): this
  public active(activate: true, initialize?: boolean): this
  public active(activate: boolean, initialize?: boolean): this
  public active(activate?: boolean, initialize?: boolean): this | boolean {
    if (activate === undefined) return this._data.isSubscribed(this._subscription)
    if (activate) this.activate(initialize)
    else this.deacivate()
    return this
  }

  
  public data(): ConcreteData
  public data(data: ConcreteData): this
  public data(data?: ConcreteData): ConcreteData | this {
    if (data === undefined) return this._data
    else {
      let isActive = this.active()
      let prevData = this._data.get()
      this.deacivate()
      this._data = data
      if (isActive) this.activate(prevData !== data.get())
      return this
    }
  }
  
  public subscription(): ConcreteSubscription
  public subscription(subscription: ConcreteSubscription, initialize?: boolean): this
  public subscription(subscription?: ConcreteSubscription, initialize?: boolean): ConcreteSubscription | this {
    if (subscription === undefined) return this._subscription
    else {
      let isActive = this.active()
      this.deacivate()
      this._subscription = subscription
      if (isActive) this.activate(initialize)
      return this
    }
  }
}


