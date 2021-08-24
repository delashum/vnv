import {ValidationError} from '../errors'
import {isValidator} from '../helpers'
import {string} from '../types'

describe('string', () => {
  const validator = string()
  const noEmptyValidator = string({allowEmpty: false})
  const clampedValidator = string({min: 5, max: 10})
  const matchValidator = string({match: /^[1-9]+$/})
  const inListValidator = string({is: ['a', 'b', 'cat']})

  it('is a validator', () => {
    expect(isValidator(validator)).toBe(true)
  })
  it('passes with a string', () => {
    expect(validator('string')).toBe('string')
  })
  it("passes with ''", () => {
    expect(validator('')).toBe('')
  })
  it('fails with a number', () => {
    expect(() => validator(12)).toThrowError(ValidationError)
  })
  it("fails with '' when {allowEmpty: false}", () => {
    expect(() => noEmptyValidator('')).toThrowError(ValidationError)
  })
  it('passes with str.length = 5 when {min: 5,max: 10}', () => {
    expect(clampedValidator('abcde')).toBe('abcde')
  })
  it('passes with str.length = 10 when {min: 5,max: 10}', () => {
    expect(clampedValidator('abcdefghij')).toBe('abcdefghij')
  })
  it('fails with str.length = 4 when {min: 5,max: 10}', () => {
    expect(() => clampedValidator('abcd')).toThrowError(ValidationError)
  })
  it('fails with str.length = 11 when {min: 5,max: 10}', () => {
    expect(() => clampedValidator('abcdefghijk')).toThrowError(ValidationError)
  })
  it("passes with '12345' with and {match:/^[1-9]+$/}", () => {
    expect(matchValidator('12345')).toBe('12345')
  })
  it("fails with '12b34' with and {match:/^[1-9]+$/}", () => {
    expect(() => matchValidator('12b34')).toThrowError(ValidationError)
  })
  it("passes with 'a' and {inList: [a,b,cat]}", () => {
    expect(inListValidator('a')).toBe('a')
  })
  it("fails with 'c' and {inList: [a,b,cat]}", () => {
    expect(() => inListValidator('c')).toThrowError(ValidationError)
  })
  it('toString()', () => {
    expect(validator.toString()).toBe('string')
  })
  it('toJSONSchema()', () => {
    expect(validator.toJSONSchema()).toEqual({$schema: 'https://json-schema.org/draft/2020-12/schema', type: 'string'})
    expect(matchValidator.toJSONSchema()).toEqual({$schema: 'https://json-schema.org/draft/2020-12/schema', type: 'string', pattern: '/^[1-9]+$/'})
    expect(inListValidator.toJSONSchema()).toEqual({$schema: 'https://json-schema.org/draft/2020-12/schema', enum: ['a', 'b', 'cat']})
    expect(clampedValidator.toJSONSchema()).toEqual({$schema: 'https://json-schema.org/draft/2020-12/schema', type: 'string', minLength: 5, maxLength: 10})
    expect(noEmptyValidator.toJSONSchema()).toEqual({$schema: 'https://json-schema.org/draft/2020-12/schema', type: 'string', minLength: 1})
  })
})
