import {ValidationError} from '../errors'
import {isValidator} from '../helpers'
import {any, dictionary, number} from '../types'

describe('dictionary', () => {
  const validator = dictionary(any())
  const nestedValidator = dictionary(number())

  it('is a validator', () => {
    expect(isValidator(validator)).toBe(true)
  })
  it('passes with empty object', () => {
    expect(validator({})).toEqual({})
  })
  it('passes with non-empty object with string key', () => {
    expect(validator({a: ''})).toEqual({a: ''})
  })
  it('passes with non-empty object with number key', () => {
    expect(validator({0: ''})).toEqual({0: ''})
  })
  it('fails with []', () => {
    expect(() => validator([])).toThrowError(ValidationError)
  })
  it('passes with nested validator and all elements match', () => {
    expect(nestedValidator({a: 1})).toEqual({a: 1})
  })
  it('fails with nested validator and some elements match', () => {
    expect(() => nestedValidator({a: 1, b: true})).toThrowError(ValidationError)
  })
  it('fails with nested validator and no elements match', () => {
    expect(() => nestedValidator({a: {}, b: true})).toThrowError(ValidationError)
  })
  it('toString()', () => {
    expect(validator.toString()).toBe('{[key]: any}')
    expect(nestedValidator.toString()).toBe('{[key]: number}')
  })
  it('toJSONSchema()', () => {
    expect(validator.toJSONSchema()).toEqual({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: {type: 'any'}
    })
    expect(nestedValidator.toJSONSchema()).toEqual({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: {type: 'number'}
    })
  })
})
