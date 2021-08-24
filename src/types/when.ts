import {getIdValue, SchemaConfigBase, validator} from '../base'
import {SchemaValidator} from '../definitions'

export interface WhenConfig {}

const run = validator<any, WhenConfig>('when', {})

export const when = (
  tag: string,
  conditions: [SchemaValidator, SchemaValidator][],
  config: Partial<WhenConfig & SchemaConfigBase<any>> = {}
) =>
  run(
    config,
    (value) => {
      const {exists, value: idValue} = getIdValue(tag)
      if (!exists) throw Error(`A when() condition must have a corresponding id, no id found for when('${tag}')`)
      let validatorMatch: SchemaValidator | undefined = undefined
      for (const [c, v] of conditions) {
        try {
          c(idValue)
          validatorMatch = v
        } catch (err) {}
        if (validatorMatch) return validatorMatch(value)
      }
      if (!validatorMatch)
        throw Error(
          `at least one condition in when('${tag}') must be met. none met with value ${JSON.stringify(value)}`
        )
    },
    undefined,
    (c, p, w) => {
      // This will spit out usable documentation. This will NOT properly validate the condition if you use the generated json schema.
      // This is a limitation of the current implementation.
      const schema = {
        output: {
          oneOf: conditions.map((v) => v[1].toJSONSchema({parentType: 'when'}).output)
        },
        meta: {
          required: !c?.optional ?? false
        }
      }
      return w(schema, p)
    }
  )
