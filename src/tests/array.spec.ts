import {ValidationError} from '../errors'
import {isValidator} from '../helpers'
import {any, array, string} from '../types'

describe('array', () => {
  const validator = array(any())
  const clampedValidator = array(any(), {minLength: 1, maxLength: 2})
  const nestedValidator = array(string())

  it('is a validator', () => {
    expect(isValidator(validator)).toBe(true)
  })
  it('passes with empty array', () => {
    expect(validator([])).toEqual([])
  })
  it('passes with non-empty array', () => {
    expect(validator([null])).toEqual([null])
  })
  it('fails with object', () => {
    expect(() => validator({})).toThrowError(ValidationError)
  })
  it('passes with arr.length = 1 when {minLength:1,maxLength:2}', () => {
    expect(clampedValidator([null])).toEqual([null])
  })
  it('passes with arr.length = 2 when {minLength:1,maxLength:2}', () => {
    expect(clampedValidator([null, null])).toEqual([null, null])
  })
  it('fails with arr.length = 0 when {minLength:1,maxLength:2}', () => {
    expect(() => clampedValidator([])).toThrowError(ValidationError)
  })
  it('fails with arr.length = 3 when {minLength:1,maxLength:2}', () => {
    expect(() => clampedValidator([null, null, null])).toThrowError(ValidationError)
  })
  it('passes with nested validator and all elements match', () => {
    expect(nestedValidator([''])).toEqual([''])
  })
  it('fails with nested validator and some elements match', () => {
    expect(() => nestedValidator(['', 1])).toThrowError(ValidationError)
  })
  it('fails with nested validator and no elements match', () => {
    expect(() => nestedValidator([1])).toThrowError(ValidationError)
  })
  it('toString()', () => {
    expect(validator.toString()).toBe('any[]')
    expect(nestedValidator.toString()).toBe('string[]')
  })
  it('toJSONSchema()', () => {
    expect(validator.toJSONSchema()).toEqual({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'array',
      items: {
        type: 'any'
      }
    })
  })
})
