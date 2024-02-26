import 'reflect-metadata'

export const ARGUMENT_OPTIONS = 'ARGUMENT_OPTIONS'

export interface ArgOptionsInterface {
  name: string,
  description: string,
  type?: 'string' | 'boolean',
  required?: boolean,
  default?: any,
  alias?: string,
}

export const Arg = (options: ArgOptionsInterface): ParameterDecorator => (target, propertyKey , parameterIndex) => {
  const params = Reflect.getOwnMetadata(ARGUMENT_OPTIONS, target.constructor) || []

  params[parameterIndex] = {
    ...options,
    type: options.type || 'string',
    required: options.required || false,
    default: options.default ? options.default : options.type === 'boolean' && !options.default ? false : undefined
  }

  Reflect.defineMetadata(ARGUMENT_OPTIONS, params, target.constructor)
}
