# KLI

## Install

> Not available yet
## Usage

```ts
@Command({
  name: 'test',
  description: '',
})
class TestCommand extends AbstractCommand {
  run(
    @Arg({
      name: 'arg1',
      description: 'testing arg1',
    })
    arg1: any,
  ) {
    console.log('arg1', arg1)
  }
}

const kli = new Kli()

kli.run({
  commands: [ TestCommand ],
})

```

call it like this

```bash
$ ts-node src/index.ts test --arg1 my-arg
```
> replace `ts-node src/index.ts` with a bin file or main file and you can use that

## Command Decorator

```ts
@Command({
  name: 'command-name' // the sub command name for this defined command
  description: '', // the description used for help of this particular command
  children: [], // An array of child commands for chaining such as command-name sub-command, sub-command's class with be defined here
})
```

## Arg Decorator
```ts
 @Arg({
  name: 'arg1', // The give name of the arg, used as --arg1 on the command line
  description: 'testing arg1', // The description of the arg, used for help output of this particular command
  type: 'string', // The type, not required, only used for boolean types
  required: false, // If required, throw an exception message to user and prevent calling
  default: 'test', // If provided, this will be inputed if --arg1 is not provided
})
```

## Boostrapping

You will need to provide all commands and desired injectable classes into the kli.run func.

```ts
const kli = new Kli()

kli.run({
  providers: [
    MySharedProvider,
  ],
  commands: [
    TestCommand,
  ],
})
```

## Global config

The global config object can be obtained within the run function as it's injected into the instantiated command

```ts
@Command({
  name: 'myCommand',
  desciption: 'example of global config usage',
})
class MyCommand extends AbstractCommand {
  async run() {
    if (this.globalConfig.dev) this.writeLn('I am in dev mode')
  }
}
```

## Sub commands

These are commands that are chainable from a given parent command

```ts

@Command({
  child: 'child',
  description: '',
})
class ChildCommand extends AbstractCommand {}

@Command({
  name: 'parent',
  description: '',
  children: [ChildCommand],
})
class ParentCommand extends AbstractCommand {}

```
In order to call the child command, you can do so like this 

```bash
$ ts-node src/index.ts parent child
```
