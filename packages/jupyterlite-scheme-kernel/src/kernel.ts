import { KernelMessage } from '@jupyterlab/services'
import { BaseKernel, IKernel } from '@jupyterlite/kernel'
import { type Evaluator, createEvaluator } from 'chez'
import { library } from './library.scm'

export class SchemeKernel extends BaseKernel implements IKernel {
  private evaluator: Evaluator | undefined

  constructor(options: any) {
    super(options)
  }

  async kernelInfoRequest(): Promise<KernelMessage.IInfoReplyMsg['content']> {
    return {
      implementation: 'Scheme',
      implementation_version: '0.2.0',
      language_info: {
        codemirror_mode: {
          name: 'scheme',
        },
        file_extension: '.scm',
        mimetype: 'text/x-scheme',
        name: 'scheme',
        version: '10.2.0',
        pygments_lexer: 'scheme',
      },
      protocol_version: '5.3',
      status: 'ok',
      banner: 'Scheme kernel using ChezScheme',
      help_links: [
        {
          text: 'Scheme Kernel',
          url: 'https://github.com/bencode/jupyterlite-scheme-kernel',
        },
      ],
    }
  }

  async executeRequest(
    content: KernelMessage.IExecuteRequestMsg['content'],
  ): Promise<KernelMessage.IExecuteReplyMsg['content']> {
    const { code } = content
    try {
      if (!this.evaluator) {
        this.evaluator = await createEvaluator()
        this.evaluator.install(library)
      }
      const result = this.evaluator.evaluate(code)
      if (result.success) {
        this.publishExecuteResult({
          execution_count: this.executionCount,
          data: {
            'text/plain': result.value,
          },
          metadata: {},
        })

        return {
          status: 'ok',
          execution_count: this.executionCount,
          user_expressions: {},
        }
      }

      const evalue = result.value
      this.publishExecuteError({
        ename: 'Evaluation Error',
        evalue,
        traceback: [],
      })

      return {
        status: 'error',
        execution_count: this.executionCount,
        ename: 'Evaluation Error',
        evalue,
        traceback: [],
      }
    } catch (e) {
      const error = e as Error
      const evalue = error.message || String(e)
      const traceback = error?.stack?.split('\n') || []
      this.publishExecuteError({
        ename: 'Evaluation Error',
        evalue,
        traceback,
      })

      return {
        status: 'error',
        execution_count: this.executionCount,
        ename: 'Evaluation Error',
        evalue,
        traceback: traceback,
      }
    }
  }

  async completeRequest(
    content: KernelMessage.ICompleteRequestMsg['content'],
  ): Promise<KernelMessage.ICompleteReplyMsg['content']> {
    return {
      matches: [],
      cursor_start: content.cursor_pos,
      cursor_end: content.cursor_pos,
      metadata: {},
      status: 'ok',
    }
  }

  async inspectRequest(
    content: KernelMessage.IInspectRequestMsg['content'],
  ): Promise<KernelMessage.IInspectReplyMsg['content']> {
    return {
      status: 'ok',
      found: false,
      data: {},
      metadata: {},
    }
  }

  async isCompleteRequest(
    content: KernelMessage.IIsCompleteRequestMsg['content'],
  ): Promise<KernelMessage.IIsCompleteReplyMsg['content']> {
    return {
      status: 'complete',
    }
  }

  async commInfoRequest(
    content: KernelMessage.ICommInfoRequestMsg['content'],
  ): Promise<KernelMessage.ICommInfoReplyMsg['content']> {
    return {
      comms: {},
      status: 'ok',
    }
  }

  inputReply(content: KernelMessage.IInputReplyMsg['content']): void {
    // Not implemented
  }

  async commOpen(msg: KernelMessage.ICommOpenMsg): Promise<void> {
    // Not implemented
  }

  async commMsg(msg: KernelMessage.ICommMsgMsg): Promise<void> {
    // Not implemented
  }

  async commClose(msg: KernelMessage.ICommCloseMsg): Promise<void> {
    // Not implemented
  }
}
