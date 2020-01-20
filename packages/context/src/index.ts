// setup global context
export function setupContext(option: Context) {
  console.log('setup context')
  context = {
    ...context,
    ...option
  }
}
