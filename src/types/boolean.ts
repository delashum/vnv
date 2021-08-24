import {SchemaConfigBase, setIdValue, validator} from '../base'
import {SchemaValidator} from '../definitions'
import {ValidationError} from '../errors'

export interface BooleanConfig {
  id?: string
}

const run = validator<boolean, BooleanConfig>('boolean', {})

export const boolean = (config: Partial<BooleanConfig & SchemaConfigBase<boolean>> = {}): SchemaValidator<boolean> =>
  run(config, (value, config) => {
    if (config.id) setIdValue(config.id, value)
    if (typeof value !== 'boolean') throw new ValidationError('must be a boolean', value, config)
    return value
  })
