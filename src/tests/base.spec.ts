import {ValidationError} from '../errors'
import {any} from '../types'

describe('base', () => {
  const validator = any()
  const optionalValidator = any({optional: true})
  const nonullValidator = any({nullable: false})
  const withDefault = any({default: 'nicedefault'})
  const falsyDefault = any({default: false})
  const withDefaultFunction = any({default: () => 123})
  it('fails with undefined', () => {
    expect(() => validator(undefined)).toThrowError(ValidationError)
  })
  it('passes with null', () => {
    validator(null)
  })
  it('passes with undefined when {optional: true}', () => {
    expect(optionalValidator(undefined)).toBe(undefined)
  })
  it('returns default', () => {
    expect(withDefault(undefined)).toBe('nicedefault')
  })
  it('returns function default', () => {
    expect(withDefaultFunction(undefined)).toBe(123)
  })
  it('returns falsyDefault', () => {
    expect(falsyDefault(undefined)).toBe(false)
  })
  it('doesnt return default if defined', () => {
    expect(withDefault(true)).toBe(true)
  })
  it('fails with null when {nullable: false}', () => {
    expect(() => nonullValidator(null)).toThrowError(ValidationError)
  })
  it('toString()', () => {
    expect(validator.toString()).toBe('any')
    expect(optionalValidator.toString()).toBe('?any')
    expect(nonullValidator.toString()).toBe('any!')
  })
})
