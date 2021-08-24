import {addPath, SchemaConfigBase, validator} from '../base'
import {SchemaValidator} from '../definitions'
import {ValidationError} from '../errors'
import {vnvMethodName} from '../symbols'

export interface ObjectConfig {
  trim: boolean
  partial: boolean
}

const run = validator<any, ObjectConfig>('object', {trim: true, partial: false})

export const object = <T, U extends Record<string | number, SchemaValidator<T>>>(
  validatorObject: U,
  config: Partial<
    ObjectConfig &
      SchemaConfigBase<
        {
          [key in keyof U]: U[key] extends SchemaValidator<infer V> ? V : unknown
        }
      >
  > = {}
): SchemaValidator<{[key in keyof U]: U[key] extends SchemaValidator<infer V> ? V : unknown}> =>
  run(
    config,
    (value, config) => {
      if (value.toString() !== '[object Object]') throw new ValidationError('must be an object', value, config)
      const whenKeys = []
      const validatedProps: any = {}
      for (const key of Object.keys(validatorObject)) {
        if (validatorObject[key][vnvMethodName] === 'when') {
          whenKeys.push(key)
          continue
        }
        if (config.partial && value[key] === undefined) continue
        const validatedValue = addPath(key, () => {
          const _validator = validatorObject[key]
          return _validator(value[key])
        })
        validatedProps[key] = validatedValue
      }
      for (const key of whenKeys) {
        if (config.partial && value[key] === undefined) continue
        const validatedValue = addPath(key, () => {
          const _validator = validatorObject[key]
          return _validator(value[key])
        })
        validatedProps[key] = validatedValue
      }
      return config.trim ? validatedProps : {...value, ...validatedProps}
    },
    (c, w) => {
      let str = '{\n'
      const keys = Object.keys(validatorObject)
      if (keys.length === 0) str = '{'
      for (const key of keys) {
        str += `  ${key}: `
        const valueType = validatorObject[key].toString()
        const lines = valueType.split('\n')
        if (lines.length === 1) str += valueType
        else for (let i = 0; i < lines.length; i++) str += `${i === 0 ? '' : '  '}${lines[i]}\n`
        if (str[str.length - 1] !== '\n') str += '\n'
      }
      str += '}'
      return w(str)
    },
    (c, p, w) => {
      const keys = Object.keys(validatorObject)
      const props = keys.map((key) => {
        return {title: key, schema: validatorObject[key].toJSONSchema({parentType: 'object'})}
      })
      let schema: {output: {type: string; properties: any; required: any}; meta: {required: boolean}} = {
        output: {
          type: 'object',
          properties: props.reduce((obj, item) => {
            return {...obj, [item.title]: item.schema.output}
          }, {}),
          required: props
            .filter((item) => {
              return item.schema?.meta?.required
            })
            .map((item) => item.title)
        },
        meta: {
          required: !c?.optional ?? false
        }
      }
      if (schema.output.required.length === 0) {
        delete schema.output.required
      }
      return w(schema, p)
    }
  )
