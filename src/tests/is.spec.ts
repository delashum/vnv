import {ValidationError} from '../errors'
import {isValidator} from '../helpers'
import {is} from '../types'

describe('is', () => {
  const isA = is('a')
  const isABC = is(['a', 'b', 'c'])
  const is123 = is(123)

  it('is a validator', () => {
    expect(isValidator(isA)).toBe(true)
  })
  it('passes with correct value', () => {
    isA('a')
  })
  it('fails with incorrect value', () => {
    expect(() => isA('b')).toThrowError(ValidationError)
  })
  it('passes with correct value set', () => {
    isABC('a')
    isABC('b')
    isABC('c')
  })
  it('fails with incorrect value set', () => {
    expect(() => isABC('d')).toThrowError(ValidationError)
    expect(() => isABC(false)).toThrowError(ValidationError)
  })
  it('passes with correct value number', () => {
    is123(123)
  })
  it('fails with incorrect value number', () => {
    expect(() => is123([])).toThrowError(ValidationError)
  })
  it('toJSONSchema()', () => {
    expect(isA.toJSONSchema()).toEqual({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      enum: ['a']
    })
    expect(isABC.toJSONSchema()).toEqual({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      enum: ['a', 'b', 'c']
    })
  })
})
