export const vnvValidatorSymbol: unique symbol = Symbol('[vnv-validator]')
export const vnvMethodName: unique symbol = Symbol('[vnv-method]')

export const pathKey: unique symbol = Symbol('[vnv-path]')
export const nameKey: unique symbol = Symbol('[vnv-name]')

export type ContextSymbol = typeof pathKey | typeof nameKey
