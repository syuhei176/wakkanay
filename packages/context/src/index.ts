// setup global context
export function setupContext(option: Context) {
  console.log('setup context')
  global.context = {
    ...global.context,
    ...option
  }
}
