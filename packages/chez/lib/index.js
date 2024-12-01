import SchemeModule from './scheme'

export async function createEvaluator() {
  const dataUrl = new URL('scheme.data', import.meta.url).href
  const wasmUrl = new URL('scheme.wasm', import.meta.url).href;

  const module = await SchemeModule({
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

  const evaluate = code => {
    return evaluator.evaluate(code)
  }
  return { evaluate }
}
