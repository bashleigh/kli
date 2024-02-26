import { COMMAND_OPTIONS, CommandOptionsInterface, PARAM_TOKENS } from "./decorators"

type ValueProvider = { token: string, value: any }

type NamedProvider = { token: string, useClass: Function }

export type Provider = Function | ValueProvider | NamedProvider

const isValueProvider = (provider: Provider): provider is ValueProvider => typeof provider === 'object' && Boolean(provider.token) && provider.hasOwnProperty('value')

const isNamedProvider = (provider: Provider): provider is NamedProvider => typeof provider === 'object' && Boolean(provider.token) && provider.hasOwnProperty('useClass')

export class Container {
  providers: { [s: string]: Provider } = {}

  /**
   * Add a provider to the container
   * @param provider
   */
  add(provider: Provider) {
    isValueProvider(provider) || isNamedProvider(provider) ? this.providers[provider.token] = provider : this.providers[provider.name] = provider
  }

  /**
   * Find and resolve a provider from it's token
   * @param token 
   * @returns 
   */
  get<T extends any>(token: string | Function): T {
    const provider = this.providers[typeof token === 'function' ? token.name : token]

    if (!provider) throw new Error('failed to get provider')

    if (isValueProvider(provider)) return provider.value

    const providerClass = isNamedProvider(provider) ? provider.useClass : provider

    const commandInfo: CommandOptionsInterface = Reflect.getOwnMetadata(COMMAND_OPTIONS, providerClass)
    const paramsInfo = Reflect.getOwnMetadata(PARAM_TOKENS, providerClass)

    const resolvedInjectables = (paramsInfo || []).map((param: { injectToken: string}) => this.get(param.injectToken))

    // console.log({
    //   paramsInfo,
    //   commandInfo,
    //   resolvedInjectables,
    // })

    // @ts-ignore // TODO how to solve this?
    return new providerClass(...resolvedInjectables)
  }
}
