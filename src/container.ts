import { PARAM_TOKENS } from "./decorators"
import constructor from "./types/constructor"

type ValueProvider = { token: string, value: any }

type NamedProvider = { token: string, useClass: constructor<any> }

export type Provider = constructor<any> | ValueProvider | NamedProvider

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
  get<T extends any>(token: string | constructor<any>): T {
    const provider = this.providers[typeof token === 'function' ? token.name : token]

    if (!provider) throw new Error('failed to get provider')

    if (isValueProvider(provider)) return provider.value

    const providerClass = isNamedProvider(provider) ? provider.useClass : provider

    const paramsInfo = Reflect.getOwnMetadata(PARAM_TOKENS, providerClass)

    const resolvedInjectables = (paramsInfo || []).map((param: { injectToken: string}) => this.get(param.injectToken))

    return new providerClass(...resolvedInjectables)
  }
}
