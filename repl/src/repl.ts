import tinyDelay from "../../app/src/tinyDelay"
import timoi from "timoi"
import { Data } from "josm"

import { setTimeout, clearTimeout, Timeout } from "long-timeout"
console.log(setTimeout)


const time = timoi()
const d = new Data(1000)
const prom = tinyDelay(d)

prom.then(() => {
  time()
})


setTimeout(() => {
  
  d.set(600)
}, 500)