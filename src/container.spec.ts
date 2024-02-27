import { Container } from "./container"

describe('Container', () => {
  it('Can add simple providers to container', () => {
    const container = new Container()

    class TestProvider {}

    container.add(TestProvider)

    expect(container.providers[TestProvider.name]).toBe(TestProvider)
  })

  it('Can add token provider', () => {
    const container = new Container()

    container.add({
      token: 'my-token',
      value: {},
    })

    expect(container.providers['my-token']).toStrictEqual({
      token: 'my-token',
      value: {},
    })
  })

  it('Can retrieve providers from container', () => {
    const container = new Container()

    class TestProvider {}

    container.add({
      token: 'my-token',
      value: { myProperty: 'test' },
    })
    container.add(TestProvider)

    expect(container.get('my-token')).toStrictEqual({ myProperty: 'test' })
    expect(container.get(TestProvider)).toBeInstanceOf(TestProvider)
  })

  it('Throw exception if no provider found', () => {
    const container = new Container()

    class TestProvider {}

    try {
      container.get(TestProvider)
      expect(true).toBeFalsy()
    } catch (error) {
      expect(error).toBeDefined()
    }
  })

  it('Can add named provider', () => {
    const container = new Container()

    class TestProvider {}

    container.add({
      token: 'my-token',
      useClass: TestProvider,
    })

    expect(container.get('my-token')).toBeInstanceOf(TestProvider)
  })
})
