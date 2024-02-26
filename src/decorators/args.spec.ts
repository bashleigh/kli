import 'reflect-metadata'
import { ARGUMENT_OPTIONS, Arg } from "./args"
import { Command } from "./command"

describe('Args', () => {
  it('Can define args on function parameters', () => {
    @Command({
      name: 'test',
      description: 'test desc',
    })
    class TestClass {
      run (
        @Arg({
          name: 'arg',
          description: 'test arg',
        })
        arg: any,
      ) {}
    }

    const args = Reflect.getMetadata(ARGUMENT_OPTIONS, TestClass)

    expect(args[0].name).toBe('arg')
    expect(args[0].description).toBe('test arg')
    expect(args[0].default).toBeUndefined()
  })

  it('Can define boolean type', () => {
    @Command({
      name: 'test',
      description: 'test desc',
    })
    class TestClass {
      run (
        @Arg({
          name: 'arg',
          description: 'test arg',
          type: 'boolean',
        })
        arg: boolean,
      ) {}
    }

    const args = Reflect.getMetadata(ARGUMENT_OPTIONS, TestClass)

    expect(args[0].default).toBe(false)
  })

  it('Can define default value', () => {
    @Command({
      name: 'test',
      description: 'test desc',
    })
    class TestClass {
      run (
        @Arg({
          name: 'arg',
          description: 'test arg',
          default: 'something',
        })
        arg: any,
      ) {}
    }

    const args = Reflect.getMetadata(ARGUMENT_OPTIONS, TestClass)

    expect(args[0].default).toBe('something')
  })

  it('Can define alias', () => {
    @Command({
      name: 'test',
      description: 'test desc',
    })
    class TestClass {
      run (
        @Arg({
          name: 'arg',
          description: 'test arg',
          alias: 'a',
        })
        arg: boolean,
      ) {}
    }

    const args = Reflect.getMetadata(ARGUMENT_OPTIONS, TestClass)

    expect(args[0].alias).toBe('a')
  })
})
