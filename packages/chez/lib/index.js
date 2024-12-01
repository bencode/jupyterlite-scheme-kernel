import SchemeModule from './scheme'

export async function createEvaluator() {
  const module = await SchemeModule()
  const evaluator = new module.SchemeEvaluator()

  const evaluate = code => {
    return evaluator.evaluate(code)
  }

  return { evaluate }
}
