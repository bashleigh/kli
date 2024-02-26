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
  protected readonly args?: ArgOptionsInterface[]
  constructor(
    @Inject('GlobalConfig')
    readonly globalConfig: GlobalConfig,
  ) {
    this.commandOptions = Reflect.getOwnMetadata(COMMAND_OPTIONS, this.constructor)
    this.args = Reflect.getOwnMetadata(ARGUMENT_OPTIONS, this.constructor)
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
  // get isParent() {
  //   return Object.values(this.children).length >= 1
  // }

  /**
   * Checks if the given arguments match all required arguments
   * @param args 
   * @returns 
   */
  isRunnable(args: {[s: string]: any}) {
    const requiredArgs = this.args?.filter(arg => arg.required)

    return requiredArgs?.every(arg => args.includes(arg.name))
  }
  
  abstract run(...params: any[]): Promise<any> | any;

  /**
   * Get the selected child command
   */
  // getSelectedChildCommand(): AbstractCommand | undefined {
  //   if (!this.childParameter) return
  //   return this.children[this.childParameter]
  // }

  /**
   * Function for printing the help display of the 
   */
  // private help() {
  //   if (this.isParent) {
  //     const childCommand = this.getSelectedChildCommand()
  //     const commands: AbstractCommand[] = childCommand ? [childCommand] : Object.values(this.children)

  //     commands.forEach(command => command.printConfig())

  //     return
  //   }

  //   this.printConfig()
  // }

  /**
   * Prints to console the commands options and configruations
   */
  protected printConfig() {
    // TODO print the config of the singular command
  }
}
