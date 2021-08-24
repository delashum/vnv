import {SchemaConfigBase, validator} from '../base'
import {SchemaValidator} from '../definitions'
import {ValidationError} from '../errors'

interface OrConfig {}

const run = validator<any, OrConfig>('or', {})

type DeArray<T> = T extends Array<infer V> ? V : unknown
type ExtractType<T> = T extends SchemaValidator<infer V> ? V : unknown
export const or = <T extends SchemaValidator<any>[]>(
  validators: T,
  config: Partial<OrConfig & SchemaConfigBase<T>> = {}
): SchemaValidator<ExtractType<DeArray<T>>> =>
  run(
    config,
    (value) => {
      for (const validator of validators) {
        try {
          return validator(value)
        } catch {}
      }
      throw new ValidationError(
        `must be one of the following types: ${validators.map((e) => e.toString()).join(' | ')}`,
        value,
        {}
      )
    },
    (c, w) => {
      return w(`(${validators.map((e) => e.toString()).join(' | ')})`)
    },
    (c, p, w) => {
      const schema = {
        output: {
          oneOf: validators.map((e) => e.toJSONSchema({parentType: 'or'}).output)
        },
        meta: {
          required: !c?.optional ?? false
        }
      }
      return w(schema, p)
    }
  )
