export const nameConsole = (name: string, desc?: string, content?: unknown, consoleType?: string) => {
  switch (consoleType) {
    case 'log':
      return console.log(`${name}: ${desc}`, content)
    case 'warn':
      return console.warn(`${name}: ${desc}`, content)
    case 'error':
      return console.error(`${name}: ${desc}`, content)
    case 'dir':
      return console.dir(`${name}: ${desc}`, content)
    default:
      return console.debug(`${name}: ${desc}`, content)
  }
}
