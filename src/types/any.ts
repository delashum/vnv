import {SchemaConfigBase, validator} from '../base'
import {SchemaValidator} from '../definitions'

export interface AnyConfig {}

const run = validator<any, AnyConfig>('any', {})

export const any = (config: Partial<AnyConfig & SchemaConfigBase<any>> = {}): SchemaValidator<any> =>
  run(config, (value, config) => value)
