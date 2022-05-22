import tinyDelay from "./../../app/src/tinyDelay"
import timoi from "timoi"
import { Data } from "josm"


const time = timoi()
const d = new Data(1000)
const prom = tinyDelay(d)

prom.then(() => {
  time()
})


setTimeout(() => {
  
  d.set(600)
}, 500)