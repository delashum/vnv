import {SchemaConfigBase, setIdValue, validator} from '../base'
import {ValidationError} from '../errors'

export interface NumberConfig {
  max: number
  min: number
  integer: boolean
  strict: boolean
  id?: string
}

const run = validator<number, NumberConfig>('number', {
  max: Infinity,
  min: -Infinity,
  integer: false,
  strict: false
})

export const number = (config: Partial<NumberConfig & SchemaConfigBase<number>> = {}) =>
  run(
    config,
    (value, config) => {
      if (config.id) setIdValue(config.id, value)
      if ((config.strict && typeof value !== 'number') || !['string', 'number'].includes(typeof value))
        throw new ValidationError('must be a number', value, config)

      if (isNaN(+value)) throw new ValidationError('must be a number', value, config)

      value = +value
      if (config.integer && !Number.isInteger(value)) throw new ValidationError(`must be an integer`, value, config)
      if (value < config.min) throw new ValidationError(`must be greater than ${config.min}`, value, config)
      if (value > config.max) throw new ValidationError(`must be less than ${config.max}`, value, config)

      return value
    },
    undefined,
    (c, p, w) => {
      if (c.min === undefined) c.min = -Infinity
      if (c.max === undefined) c.max = Infinity
      if (c.strict === undefined) c.strict = false

      let schema = {
        output: {
          type: 'number' // TODO: We need to also handle integer types. VNV does not currently support them.
        },
        meta: {
          required: !c?.optional ?? false
        }
      }
      if (c.min !== -Infinity) schema.output = {...schema.output, ...{minimum: c?.min}}
      if (c.max !== Infinity) schema.output = {...schema.output, ...{maximum: c?.max}}

      return w(schema, p)
    }
  )
