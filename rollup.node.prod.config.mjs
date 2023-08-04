import { merge } from "webpack-merge"
import commonMod from "./rollup.node.common.config.mjs"


export default merge(commonMod, {
  input: 'app/src/tinyDelay.ts',
  output: {
    file: 'app/dist/cjs/tinyDelay.js',
    format: 'cjs'
  },
})