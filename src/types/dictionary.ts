import {addPath, SchemaConfigBase, validator} from '../base'
import {SchemaValidator} from '../definitions'
import {ValidationError} from '../errors'

interface DictionaryConfig {}

const run = validator<any, DictionaryConfig>('dictionary', {})

export const dictionary = <T>(
  validator: SchemaValidator<T>,
  config: Partial<DictionaryConfig & SchemaConfigBase<Record<string | number, T>>> = {}
): SchemaValidator<Record<string | number, T>> =>
  run(
    config,
    (value, config) => {
      if (value.toString() !== '[object Object]') throw new ValidationError('must be an object', value, config)

      return Object.keys(value).reduce(
        (newObj, key) =>
          addPath(key, () => {
            newObj[key] = validator(value[key])
            return newObj
          }),
        {} as any
      )
    },
    (c, w) => w(`{[key]: ${validator.toString()}}`),
    (c, p, w) => {
      const schema = {
        output: {
          type: 'object',
          additionalProperties: validator.toJSONSchema({parentType: 'dictionary'}).output
        },
        meta: {
          required: !c?.optional ?? false
        }
      }
      return w(schema, p)
    }
  )
