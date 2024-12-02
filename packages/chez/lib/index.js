import SchemeModule from './scheme'

export async function createEvaluator(opts) {
  const dataUrl = new URL('scheme.data', import.meta.url).href
  const wasmUrl = new URL('scheme.wasm', import.meta.url).href;

  const module = await SchemeModule({
    print: message => {
      console.log(message)
      opts?.onMessage({ type: 'log', message })
    },

    printErr: message => {
      console.error(message)
      opts?.onMessage({ type: 'error', message })
    },

    locateFile: name => {
      if (name === 'scheme.data') {
        return dataUrl
      }
      if (name === 'scheme.wasm') {
        return wasmUrl
      }
      return name
    }
  })
  const evaluator = new module.SchemeEvaluator()

  const install = code => {
    evaluator.execute(code)
  }

  const evaluate = code => {
    return evaluator.evaluate(code)
  }
  return { install, evaluate }
}
