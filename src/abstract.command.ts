import { readFileSync, writeFileSync } from 'fs'
import { ARGUMENT_OPTIONS, ArgOptionsInterface, COMMAND_OPTIONS, CommandOptionsInterface, Inject } from './decorators'

export interface GlobalConfig {
  commandName: string,
  devMode: boolean,
  childParameters?: string[],
  [s: string]: any,
}

export abstract class AbstractCommand {
  protected readonly commandOptions: CommandOptionsInterface
  protected readonly argOptions?: ArgOptionsInterface[]
  constructor(
    @Inject('GlobalConfig')
    readonly globalConfig: GlobalConfig,
  ) {
    this.commandOptions = Reflect.getOwnMetadata(COMMAND_OPTIONS, this.constructor)
    this.argOptions = Reflect.getOwnMetadata(ARGUMENT_OPTIONS, this.constructor)
  }

  /**
   * Store command config 
   * @param config Yuor command's config
   * @param options 
   */
  protected storeCommandConfig<T>(config: T, options?: { filename?: string, path?: string }) {
    // TODO add cwd as default root path
    writeFileSync(options?.filename || this.globalConfig.commandName, JSON.stringify(config, null, 2), 'utf8')
  }

  /**
   * Get the stored command config
   * @param options 
   * @returns 
   */
  protected getCommandConfig<T>(options?: { filename?: string, path?: string }): T {
    // TODO add cwd as default root path
    return JSON.parse(readFileSync(options?.filename || this.globalConfig.commandName, 'utf8'))
    // TODO resolve a default value such as {}
  }

  /**
   * Write a line to the console
   * @param line 
   * @param tabbed 
   * @param tabValue 
   */
  protected writeLn(line: string, tabbed: number = 0, tabValue: string = '\t') {
    console.log(
      `${
        tabbed
          ? Array.from(Array(tabbed).keys())
              .map(() => tabValue)
              .join('')
          : ''
      }${line}`,
    )
  }

  /**
   * Quick boolean on whether the command has children commands
   */
  get isParent(): boolean {
    return Boolean(this.commandOptions.children && this.commandOptions.children.length >= 1)
  }
  
  abstract run(...params: any[]): Promise<any> | any;

  /**
   * Function for printing the help display of the 
   */
  help() {
    this.printConfig(this.commandOptions, this.argOptions)

    if (this.isParent) {
      this.commandOptions.children?.forEach(child => {
        const commandOptions = Reflect.getOwnMetadata(COMMAND_OPTIONS, child)
        const argOptions = Reflect.getOwnMetadata(ARGUMENT_OPTIONS, child)

        this.printConfig(commandOptions, argOptions)
      })
    }
  }

  /**
   * Prints to console the given command options and arguments
   */
  protected printConfig(commandOptions: CommandOptionsInterface, argOptions?: ArgOptionsInterface[]) {
    this.writeLn(commandOptions.name)
    this.writeLn(commandOptions.description)

    argOptions?.forEach(arg => {
      this.writeLn(arg.name)
      this.writeLn(`${arg.required ? '[Required] ' : ''}${arg.description}`)
      arg.default && this.writeLn(`Default: ${arg.default}`)
    })
  }
}
