import {SchemaConfigBase, setIdValue, validator} from '../base'
import {ValidationError} from '../errors'

export interface StringConfig {
  max: number
  min: number
  match?: RegExp
  allowEmpty: boolean
  is?: string | string[]
  id?: string
}

const run = validator<string, StringConfig>('string', {
  min: 0,
  max: Infinity,
  allowEmpty: true
})

export const string = (config: Partial<StringConfig & SchemaConfigBase<string>> = {}) =>
  run(
    config,
    (value, config) => {
      if (config.id) setIdValue(config.id, value)
      if (typeof value !== 'string') throw new ValidationError('must be a string', value, config)

      if (value === '' && !config.allowEmpty) throw new ValidationError('cannot be empty', value, config)

      if (value.length < config.min) throw new ValidationError(`min length is ${config.min}`, value, config)

      if (value.length > config.max) throw new ValidationError(`max length is ${config.max}`, value, config)

      if (config.is)
        if (Array.isArray(config.is) ? config.is.includes(value) === false : config.is === value)
          throw new ValidationError(`must be one of the following values ${config.is}`, value, config)

      if (config.match?.test(value) === false)
        throw new ValidationError(`doesn't match the pattern ${config.match}`, value, config)

      return value
    },
    undefined,
    (c, p, w) => {
      if (c.min === undefined) c.max = Infinity

      let schema: any = {
        output: {
          type: 'string'
        },
        meta: {
          required: !c?.optional ?? false
        }
      }
      if (c.min !== undefined && c.max !== Infinity) schema.output = {...schema.output, ...{minLength: c?.min}}
      if (c.max !== Infinity) schema.output = {...schema.output, ...{maxLength: c?.max}}
      if (c.match !== undefined) schema.output = {...schema.output, ...{pattern: `${c?.match}`}}
      if (c.allowEmpty !== undefined && !c.allowEmpty) schema.output = {...schema.output, ...{minLength: 1}}
      if (c.is !== undefined) schema.output = {enum: c.is}
      return w(schema, p)
    }
  )
