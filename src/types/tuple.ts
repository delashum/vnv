import {addPath, SchemaConfigBase, validator} from '../base'
import {SchemaValidator} from '../definitions'
import {ValidationError} from '../errors'

export interface TupleConfig {}

const run = validator<any, TupleConfig>('tuple', {})

export const tuple = <
  T extends SchemaValidator[],
  U extends {
    [I in keyof T]: T[I] extends SchemaValidator<infer V> ? V : unknown
  }
>(
  validators: [...T],
  config: Partial<TupleConfig & SchemaConfigBase<U>> = {}
): SchemaValidator<U> =>
  run(
    config,
    (value) => {
      if (!Array.isArray(value)) throw new ValidationError('must be an array', value, config)

      if (value.length > validators.length)
        throw new ValidationError(`must not have more than ${validators.length} entries`, value, config)

      return validators.map((fn, i) => addPath(i, () => fn(value[i]))).filter((e) => e !== undefined)
    },
    (c, w) => w(`[${validators.map((e) => e.toString()).join(', ')}]`),
    (c, p, w) => {
      const vObjects = validators.map((v) => v.toJSONSchema({parentType: 'tuple'}))
      const schema = {
        output: {
          type: 'array',
          items: vObjects.map((v) => v.output),
          minItems: validators.length - vObjects.filter((v) => !v.meta.required).length,
          maxItems: validators.length
        },
        meta: {
          required: !c?.optional ?? false
        }
      }
      return w(schema, p)
    }
  )
