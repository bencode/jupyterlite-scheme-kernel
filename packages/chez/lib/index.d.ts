declare module 'chez' {
  export type Evaluator = {
    evaluate: (code: string) => unknown
  }
  export function createEvaluator(): Evaluator
}
