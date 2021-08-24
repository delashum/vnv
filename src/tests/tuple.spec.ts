import {ValidationError} from '../errors'
import {isValidator} from '../helpers'
import {any, array, boolean, number, string, tuple} from '../types'

describe('tuple', () => {
  const validator = tuple([])
  const singleValidator = tuple([string()])
  const multiValidator = tuple([string(), number(), boolean(), array(any(), {optional: true})])

  it('is a validator', () => {
    expect(isValidator(validator)).toBe(true)
  })
  it('passes with correct length', () => {
    expect(singleValidator(['abc'])).toEqual(['abc'])
  })
  it('fails with incorrect length', () => {
    expect(() => singleValidator(['abc', 'def'])).toThrowError(ValidationError)
  })
  it('fails with non-array', () => {
    expect(() => singleValidator(1)).toThrowError(ValidationError)
  })
  it('fails with incorrect type', () => {
    expect(() => singleValidator([1])).toThrowError(ValidationError)
  })
  it('passes with multi length', () => {
    expect(multiValidator(['a', 1, false, []])).toEqual(['a', 1, false, []])
  })
  it('passes omitting optional', () => {
    expect(multiValidator(['a', 1, false])).toEqual(['a', 1, false])
  })
  it('fails with incorrect order', () => {
    expect(() => multiValidator([1, 'a', false])).toThrowError(ValidationError)
  })
  it('toString()', () => {
    expect(validator.toString()).toBe('[]')
    expect(singleValidator.toString()).toBe('[string]')
    expect(multiValidator.toString()).toBe('[string, number, boolean, ?any[]]')
  })
  it('toJSONSchema()', () => {
    expect(validator.toJSONSchema()).toEqual({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'array',
      items: [],
      minItems: 0,
      maxItems: 0
    })
    expect(singleValidator.toJSONSchema()).toEqual({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'array',
      items: [{type: 'string'}],
      minItems: 1,
      maxItems: 1
    })
    expect(multiValidator.toJSONSchema()).toEqual({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'array',
      items: [{type: 'string'}, {type: 'number'}, {type: 'boolean'}, {type: 'array', items: {type: 'any'}}],
      minItems: 3,
      maxItems: 4
    })
  })
})
