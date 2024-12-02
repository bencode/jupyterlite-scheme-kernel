declare module 'chez' {
  export type Evaluator = {
    install: (code: string) => void
    evaluate: (code: string) => EvalResult
  }
  export type EvalResult = {
    success: boolean
    value: string
  }
  export function createEvaluator(): Promise<Evaluator>
}
