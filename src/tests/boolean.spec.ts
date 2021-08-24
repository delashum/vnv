import {ValidationError} from '../errors'
import {isValidator} from '../helpers'
import {boolean} from '../types'

describe('boolean', () => {
  const validator = boolean()

  it('is a validator', () => {
    expect(isValidator(validator)).toBe(true)
  })
  it('passes with true', () => {
    expect(validator(true)).toBe(true)
  })
  it('passes with false', () => {
    expect(validator(false)).toBe(false)
  })
  it('fails with undefined', () => {
    expect(() => validator(undefined)).toThrowError(ValidationError)
  })
  it('fails with 1', () => {
    expect(() => validator(1)).toThrowError(ValidationError)
  })
  it('fails with 0', () => {
    expect(() => validator(0)).toThrowError(ValidationError)
  })
  it("fails with ''", () => {
    expect(() => validator('')).toThrowError(ValidationError)
  })
  it('toString()', () => {
    expect(validator.toString()).toBe('boolean')
  })
  it('toJSONSchema()', () => {
    expect(validator.toJSONSchema()).toEqual({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'boolean'
    })
  })
})
