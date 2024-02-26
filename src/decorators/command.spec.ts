import 'reflect-metadata'
import { COMMAND_OPTIONS, Command, PARAM_TOKENS } from './command'
import { Inject } from './inject'

describe('Command', () => {
  it('Can define properties to class', () => {
    @Command({
      name: 'test',
      description: 'test desc',
    })
    class TestClass {}

    const reflection = Reflect.getMetadata(COMMAND_OPTIONS, TestClass)

    expect(reflection.name).toBeDefined()
    expect(reflection.description).toBeDefined()
  })

  it('Can define constructor arguments for injection', () => {
    @Command({
      name: 'test',
      description: 'test desc',
    })
    class AnotherClass {}

    @Command({
      name: 'test',
      description: 'test desc',
    })
    class TestClass {
      constructor(
        private readonly testParam: AnotherClass,
        @Inject('my-token') private readonly tokenProvider: any,
      ) {}
    }

    const parameters = Reflect.getMetadata(PARAM_TOKENS, TestClass)

    expect(parameters[0].injectToken).toBe(AnotherClass.name)
    expect(parameters[1].injectToken).toBe('my-token')
  })
})
