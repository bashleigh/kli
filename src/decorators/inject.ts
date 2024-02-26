export const Inject =
  (token?: string): ParameterDecorator =>
  (target, propertyKey, paramIndex) => {
    Reflect.defineMetadata(
      `param::${paramIndex}`,
      {
        token,
      },
      target,
    )
  }
