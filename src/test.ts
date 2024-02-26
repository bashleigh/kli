import 'reflect-metadata'
import { AbstractCommand } from "./abstract.command";
import { Arg, Command } from "./decorators";
import { Kli } from './index'

@Command({
  name: 'child',
  description: '',
})
class TestChildCommand extends AbstractCommand {
  run(@Arg({
    name: 'arg1',
    description: 'testing arg1',
    default: 'test',
    required: true,
  })
  arg1: any,
  ) {
    console.log('arg1', arg1, this.globalConfig)
  }
}

@Command({
  name: 'test',
  description: '',
  children: [TestChildCommand],
})
class TestCommand extends AbstractCommand {
  run(
    @Arg({
      name: 'arg1',
      description: 'testing arg1',
    })
    arg1: any,
  ) {
    console.log('run', this.globalConfig)
  }
}

const kli = new Kli()

kli.run({
  commands: [ TestCommand ],
})
