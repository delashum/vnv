import {ValidationError} from '../errors'
import {isValidator} from '../helpers'
import {boolean, or, string} from '../types'

describe('or', () => {
  const validator = or([string(), boolean()])

  it('is a validator', () => {
    expect(isValidator(validator)).toBe(true)
  })
  it('passes when it matches first validator', () => {
    expect(validator('')).toBe('')
  })
  it('passes when it matches second validator', () => {
    expect(validator(true)).toBe(true)
  })
  it('fails when it matches no validator', () => {
    expect(() => validator(123)).toThrowError(ValidationError)
  })
  it('toString()', () => {
    expect(validator.toString()).toBe('(string | boolean)')
  })
  it('toJSONSchema()', () => {
    expect(validator.toJSONSchema()).toEqual({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      oneOf: [{type: 'string'}, {type: 'boolean'}]
    })
  })
})
