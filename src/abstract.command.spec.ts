import { AbstractCommand } from "./abstract.command"
import { Arg, Command } from "./decorators"

@Command({
  name: 'test',
  description: 'test desc',
})
class TestCommand extends AbstractCommand {
  run(
    @Arg({
      name: 'test',
      description: '',
    })
    arg: string,
  ) {
    
  }

  getCommandOptions = () => this.commandOptions
  getArgOptions = () => this.argOptions

  writeLineTest = () => this.writeLn('test string', 2)
}

@Command({
  name: 'parent',
  description: 'parent desc',
  children: [TestCommand],
})
class ParentCommand extends AbstractCommand {
  run() {
    
  }
}

describe('AbstractCommand', () => {
  let command: TestCommand
  beforeAll(() => {
    command = new TestCommand({
      commandName: 'test',
      devMode: false,
    })
  })

  it('command options will be pressent', () => {
    expect(command.getCommandOptions()).toBeDefined()
  })

  it('arg options should be present', () => {
    expect(command.getArgOptions()).toBeDefined()
  })

  it('isParent should be false', () => {
    expect(command.isParent).toBeFalsy()
  })

  it('Help command will print to console', () => {
    console.log = jest.fn()

    command.help()

    expect(console.log).toHaveBeenCalled()
  })

  it('write line with tabs', () => {
    console.log = jest.fn()

    command.writeLineTest()

    expect(console.log).toHaveBeenCalledWith('\t\ttest string')
  })

  describe('parent', () => {
    let command: ParentCommand

    beforeAll(() => {
      command = new ParentCommand({
        devMode: false,
        commandName: 'parent',
      })
    })

    it('isParent should be true', () => {
      expect(command.isParent).toBeTruthy()
    })
  
    it('Help command will print to console', () => {
      console.log = jest.fn()
  
      command.help()
  
      expect(console.log).toHaveBeenCalled()
    })
  })
})
