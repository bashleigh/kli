import 'reflect-metadata'

const COMMAND_OPTIONS = 'COMMAND_OPTIONS'
const PARAM_TOKENS = 'PARAM_TOKENS'

export interface CommandOptionsInterface {
  name: string,
  description: string,
  children?: Function[], // AbstractCommand
}

const Command = (options: CommandOptionsInterface): ClassDecorator => (target) => {
  const prototype = target.prototype

  const parameters = Reflect.getMetadata('design:paramtypes', prototype.constructor)

  Reflect.defineMetadata(COMMAND_OPTIONS, options, target)

  if (parameters) {
    const paramTokens = parameters.map((param: any, index: number) => {
      const injectInfo = Reflect.getMetadata(`param::${index}`, target)
      const customToken = injectInfo?.token
      const injectToken = customToken || param.name

      return {
        injectToken,
        typeName: param.name,
      }
    })

    Reflect.defineMetadata(PARAM_TOKENS, paramTokens, target)
  }
}
type ValueProvider = { token: string, value: any }

type Provider = Function | ValueProvider
const isValueProvider = (provider: Provider): provider is ValueProvider => typeof provider === 'object' && Boolean(provider.token)

class Container {
  instances: { [s: string]: Provider } = {}

  add(provider: Provider) {
    isValueProvider(provider) ? this.instances[provider.token] = provider : this.instances[provider.name] = provider
  }

  get(token: string | Function) {
    console.log('token', token)
    const provider = this.instances[typeof token === 'function' ? token.name : token]

    if (!provider) throw new Error('failed to get provider')

    if (isValueProvider(provider)) return provider.value

    const commandInfo = Reflect.getOwnMetadata(COMMAND_OPTIONS, provider)
    const paramsInfo = Reflect.getOwnMetadata(PARAM_TOKENS, provider)

    const resolvedInjectables = (paramsInfo || []).map((param: { injectToken: string}) => this.get(param.injectToken))

    console.log({
      paramsInfo,
      commandInfo,
      resolvedInjectables,
    })

    // @ts-ignore // TODO how to solve this?
    return new provider(...resolvedInjectables)
  }
}

const inject = (token?: string): ParameterDecorator => (target, propertyKey, paramIndex) => {
  Reflect.defineMetadata(`param::${paramIndex}`, {
    token,
  }, target)
}

class AnotherClass {}

abstract class AbstractTestClass {
  constructor(
    @inject('testtoken')
    private readonly test: string,
    private readonly another: AnotherClass,
  ) {
    console.log('test', this.test)
    console.log('another', this.another)
  }
}

@Command({
  name: 'test',
  description: '',
})
class TestClass extends AbstractTestClass {
  
}


const container = new Container()

container.add({
  token: 'testtoken',
  value: {
    myProperty: 'myValue',
  },
})

container.add(AnotherClass)
container.add(TestClass)

console.log('container', container.instances)

console.log(container.get(TestClass))
