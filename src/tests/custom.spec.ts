import {CustomValidationError, ValidationError} from '../errors'
import {isValidator} from '../helpers'
import {custom} from '../types'

describe('custom', () => {
  const isFunction = custom(
    (val) => {
      if (typeof val !== 'function') throw new CustomValidationError('should be a function')
      return val
    },
    undefined,
    () => {
      return {
        type: 'object',
        properties: {
          name: {
            type: 'string'
          }
        }
      }
    }
  )

  it('is a validator', () => {
    expect(isValidator(isFunction)).toBe(true)
  })
  it('passes with correct value', () => {
    isFunction(() => {})
  })
  it('fails with incorrect value', () => {
    expect(() => isFunction([])).toThrowError(ValidationError)
  })
  it('fails with undefined', () => {
    expect(() => isFunction(undefined)).toThrowError(ValidationError)
  })
  it('returns custom schema on toJSONSchema', () => {
    const schema = isFunction.toJSONSchema()
    expect(typeof schema).toBe('object')
    expect(isFunction.toString()).toBe('custom')
    expect(schema).toEqual({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        name: {
          type: 'string'
        }
      }
    })
  })
})
