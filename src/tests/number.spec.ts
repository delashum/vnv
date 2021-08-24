import {ValidationError} from '../errors'
import {isValidator} from '../helpers'
import {number} from '../types'

describe('number', () => {
  const validator = number()
  const strictValidator = number({strict: true})
  const clampingValidator = number({min: 1, max: 9})
  const integerValidator = number({integer: true})

  it('is a validator', () => {
    expect(isValidator(validator)).toBe(true)
  })
  it('passes with an int', () => {
    expect(validator(123)).toBe(123)
  })
  it('passes with a float', () => {
    expect(validator(Math.PI)).toBe(Math.PI)
  })
  it('passes with a negative number', () => {
    expect(validator(-123)).toBe(-123)
  })
  it('passes with 0', () => {
    expect(validator(0)).toBe(0)
  })
  it('passes with a string number', () => {
    expect(validator('123')).toBe(123)
  })
  it('fails with a string', () => {
    expect(() => validator('a')).toThrowError(ValidationError)
  })
  it('fails with false', () => {
    expect(() => validator(false)).toThrowError(ValidationError)
  })
  it('fails with true', () => {
    expect(() => validator(true)).toThrowError(ValidationError)
  })
  it('fails with an object', () => {
    expect(() => validator({})).toThrowError(ValidationError)
  })
  it('fails with undefined', () => {
    expect(() => validator(undefined)).toThrowError(ValidationError)
  })
  it('passes with a number when strict:true', () => {
    expect(strictValidator(123)).toBe(123)
  })
  it('fails with a string number when strict:true', () => {
    expect(() => strictValidator('123')).toThrowError(ValidationError)
  })
  it('passes with a 1 and bound {min:1,max:9}', () => {
    expect(clampingValidator(1)).toBe(1)
  })
  it('passes with a 9 and bound {min:1,max:9}', () => {
    expect(clampingValidator(9)).toBe(9)
  })
  it('fails with a 10 and bound {min:1,max:9}', () => {
    expect(() => clampingValidator(10)).toThrowError(ValidationError)
  })
  it('fails with a 0 and bound {min:1,max:9}', () => {
    expect(() => clampingValidator(0)).toThrowError(ValidationError)
  })
  it('passes with integer', () => {
    integerValidator(0)
    integerValidator(1)
    integerValidator(-1)
    integerValidator(2)
  })
  it('fails with float', () => {
    expect(() => integerValidator(0.5)).toThrowError(ValidationError)
    expect(() => integerValidator(2.5)).toThrowError(ValidationError)
    expect(() => integerValidator(-2.5)).toThrowError(ValidationError)
    expect(() => integerValidator(Math.PI)).toThrowError(ValidationError)
    expect(() => integerValidator(Infinity)).toThrowError(ValidationError)
  })
  it('toString()', () => {
    expect(validator.toString()).toBe('number')
  })
  it('toJSONSchema()', () => {
    expect(validator.toJSONSchema()).toEqual({$schema: 'https://json-schema.org/draft/2020-12/schema', type: 'number'})
    expect(integerValidator.toJSONSchema()).toEqual({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'number'
    })
  })
})
