import 'reflect-metadata'

export const ARGUMENT_OPTIONS = 'ARGUMENT_OPTIONS'

export interface ArgOptionsInterface {
  name: string,
  description: string,
  type?: 'string' | 'boolean',
  required?: boolean,
  default?: any,
}

export const Arg = (options: ArgOptionsInterface): ParameterDecorator => (target, propertyKey , parameterIndex) => {
  const params = Reflect.getOwnMetadata(ARGUMENT_OPTIONS, target.constructor) || []

  params[parameterIndex] = {
    ...options,
    type: options.type || 'string',
    required: options.required || false,
  }

  Reflect.defineMetadata(ARGUMENT_OPTIONS, params, target.constructor)
}
