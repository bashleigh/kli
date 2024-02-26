import { AbstractCommand, GlobalConfig } from './abstract.command'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { Container, Provider } from './container'
import { ARGUMENT_OPTIONS, ArgOptionsInterface, COMMAND_OPTIONS, CommandOptionsInterface } from './decorators'
import 'reflect-metadata'
import constructor from './types/constructor'

export * from './abstract.command'
export * from './decorators'

export const isCommandConfig = (config: CommandOptionsInterface | { default: true }): config is CommandOptionsInterface =>
  Object.prototype.hasOwnProperty.call(config, 'name')

export class Kli {
  private readonly container: Container = new Container
  private commandNameArgs: string[] = []
  private childNamedArgs: string[] = []
  private args: {[s: string]: any} = {}

  private async init() {
    const argv = await yargs(hideBin(process.argv)).argv
    console.log(argv)

    const commandNameArgs = argv._
    const childParameters = [...commandNameArgs]
    childParameters.shift()
    const args: {[s: string]: any} = argv
    args.$0 = undefined
    args._ = undefined

    this.commandNameArgs = commandNameArgs.map(name => name.toString())
    this.childNamedArgs = childParameters.map(name => name.toString())
    this.args = args
  }

  private bootstrapContainer({
    providers,
    commands,
  }: {
    providers?: Provider[],
    commands: constructor<AbstractCommand>[],
  }) {
    const globalConfig: GlobalConfig = {
      commandName: this.commandNameArgs[0].toString(),
      devMode: Object.keys(this.childNamedArgs).includes('dev'),
      childParameters: this.childNamedArgs.map(param => param.toString()),
    }
  
    this.container.add({
      token: 'GlobalConfig',
      value: globalConfig,
    })
  
    providers?.forEach(provider => this.container.add(provider))
    commands.forEach(command => {
      const commandConfig: CommandOptionsInterface | undefined = Reflect.getOwnMetadata(COMMAND_OPTIONS, command)
      if (!commandConfig) throw new Error(`Command config not found for [${command.prototype}]`)
      this.container.add({
        token: commandConfig.name,
        useClass: command,
      })
  
      // TODO need to make this recursive
      commandConfig.children?.map(child => {
        const childCommandConfig = Reflect.getOwnMetadata(COMMAND_OPTIONS, child)
        this.container.add({
          token: `${commandConfig.name} ${childCommandConfig.name}`,
          useClass: child,
        })
      })
    })
  }

  protected resolveArgs(command: AbstractCommand) {
    const argOptions: ArgOptionsInterface[] = Reflect.getMetadata(ARGUMENT_OPTIONS, command.constructor)
    
    return argOptions?.map((options) => this.args[options.name] || options.alias && this.args[options.alias] || options.default) || []
  }

  protected validateArgs(command: AbstractCommand) {
    const argOptions: ArgOptionsInterface[] = Reflect.getMetadata(ARGUMENT_OPTIONS, command.constructor)

    argOptions?.filter(options => options.required).forEach(options => {
      if (!this.args[options.name]) throw new Error(`Required arg [${options.name}] was not provided. Please make sure this arg is provided`)
    })
  }

  public async run({
    providers,
    commands,
  }: {
    providers?: Provider[],
    commands: constructor<AbstractCommand>[],
  }) {
    await this.init()

    this.bootstrapContainer({ providers, commands })

    const command = this.container.get<AbstractCommand>(this.commandNameArgs.map(arg => arg.toString()).join(' '))

    console.log('command', command)

    this.validateArgs(command)
    const args = this.resolveArgs(command)

    console.log(this.args, Object.keys(this.args), Object.keys(this.args).includes('h'))

    if (Object.keys(this.args).includes('help') || Object.keys(this.args).includes('h')) command.help()

    else command.run(...args)
  }
}
