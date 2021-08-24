import {isValidator} from '../helpers'
import {any} from '../types'

describe('any', () => {
  const validator = any()

  it('is a validator', () => {
    expect(isValidator(validator)).toBe(true)
  })
  it('passes with a string', () => {
    expect(validator('string')).toBe('string')
  })
  it('passes with a number', () => {
    expect(validator(12)).toBe(12)
  })
  it('passes with false', () => {
    expect(validator(false)).toBe(false)
  })
  it('passes with 0', () => {
    expect(validator(0)).toBe(0)
  })
  it('toString()', () => {
    expect(validator.toString()).toBe('any')
  })
  it('toJSONSchema()', () => {
    expect(validator.toJSONSchema()).toEqual({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'any'
    })
  })
})
