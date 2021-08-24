import {SchemaValidator} from './definitions'
import {ValidationError} from './errors'
import {ContextSymbol, nameKey, pathKey, vnvMethodName, vnvValidatorSymbol} from './symbols'

export interface SchemaConfigBase<T = any> {
  optional: boolean
  nullable: boolean
  default: T | (() => T)
}

const BASE_DEFAULTS: SchemaConfigBase = {
  optional: false,
  nullable: true,
  default: undefined
}

class MyFunction extends Function {
  toString() {
    return 'yeeesh'
  }
}

const base = (value: any, config: SchemaConfigBase) => {
  if (value === undefined) {
    if (config.default !== undefined) return typeof config.default === 'function' ? config.default() : config.default
    if (config.optional) return undefined
    throw new ValidationError('value is required', value, config)
  }

  if (!config.nullable && value === null) throw new ValidationError('value cannot be null', value, config)

  return value
}

const baseToString = (config: SchemaConfigBase, str: string) => {
  let lead = '',
      tail = ''
  if (config.optional) lead += '?'
  if (!config.nullable) tail += '!'

  return lead + str + tail
}

export interface JSONSchemaProperties {
  parentType: string|null
  $schema?: string
}

const JSPropertyDefaults: JSONSchemaProperties = {
  parentType: null,
  $schema: 'https://json-schema.org/draft/2020-12/schema'
}

export const finaltransformer = (schema: Record<any, any>, properties: JSONSchemaProperties) => {
  if (properties.parentType == null) return {...{$schema: properties.$schema}, ...schema.output}
  return schema
}

const defaultToJSONSchema = (config: SchemaConfigBase, typename: string, properties: JSONSchemaProperties, schemaWrap: typeof finaltransformer) => {
  const schema = {output: {type: typename}, meta: {required: !config.optional}}
  return schemaWrap(schema, properties)
}


/** SESSION */

type StoreKey = 'l' | 'g'

const session = () => {
  const stack: any[] = []
  let ctx: {[k: string]: any}
  let global: {[k: string]: any}
  const wrap = <T>(callback: (level: number) => T) => {
    if (ctx) stack.push(ctx)
    ctx = {...ctx}
    if (stack.length === 0) global = {}
    try {
      const value = callback(stack.length)
      reset()
      return value
    } catch (err) {
      reset()
      if (err instanceof ValidationError) throw new ValidationError(err)
      throw err
    }
  }
  const set = (key: string | ContextSymbol, val: any, store: StoreKey = 'l') => {
    if (store === 'l') ctx[key as string] = val
    else global[key as string] = val
  }
  const get = (key: string | ContextSymbol, store: StoreKey = 'l') => {
    if (store === 'l') return ctx[key as string]
    else return global[key as string]
  }
  const has = (key: string | ContextSymbol, store: StoreKey = 'l') => {
    if (store === 'l') return key in ctx
    else return key in global
  }

  const reset = () => {
    ctx = stack.pop()
  }

  return {wrap, set, get, has}
}

const {set, get, has, wrap} = session()

export const validator = <T, S = {}>(name: string, defaults: S) => (
  config: Partial<S>,
  callback: (value: T, config: S) => T,
  stringify?: (config: S, wrap: (str: string) => string) => string,
  schemaify?: (config: S & SchemaConfigBase<T>, properties: JSONSchemaProperties, transformer: typeof finaltransformer) => any // Returns JSON Schema
): SchemaValidator<T> => {
  const _config = {...BASE_DEFAULTS, ...defaults, ...config}
  function myCallback(val: any) {
    return wrap((level) => {
      if (level === 0) set(pathKey, [])
      set(nameKey, name)
      const validatedBase = base(val, _config)
      if (validatedBase == null) return validatedBase
      return callback(validatedBase, _config)
    })
  }
  ;(myCallback as any)[vnvValidatorSymbol] = true
  ;(myCallback as any)[vnvMethodName] = name
  myCallback.toString = () => stringify?.(_config, (str) => baseToString(_config, str)) ?? baseToString(_config, name)
  myCallback.toJSONSchema = (properties=JSPropertyDefaults) => {
      return schemaify?.(_config, properties, finaltransformer) ?? defaultToJSONSchema(_config, name, properties, finaltransformer)
  }
  return myCallback as any
}

export const addPath = <T>(segment: string | number, callback: () => T) => {
  return wrap(() => {
    set(pathKey, [...get(pathKey), segment])
    return callback()
  })
}

export const setIdValue = (id: string, value: any) => {
  if (has(id, 'g')) throw Error(`Each validator id must be unique, id='${id}' was defined twice`)
  set(id, value, 'g')
}

export const getIdValue = (id: string) => {
  return {value: get(id, 'g'), exists: has(id, 'g')}
}

export const getSession = () => ({
  path: get(pathKey),
  name: get(nameKey)
})
