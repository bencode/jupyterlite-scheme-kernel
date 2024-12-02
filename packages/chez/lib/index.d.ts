declare module 'chez' {
  export type Evaluator = {
    install: (code: string) => void
    evaluate: (code: string) => EvalResult
  }
  export type EvalResult = {
    success: boolean
    value: string
  }
  export type CreateOptions = {
    onMessage: (bundle: { type: string; message: string }) => void
  }
  export function createEvaluator(opts: CreateOptions): Promise<Evaluator>
}
