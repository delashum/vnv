import {ValidationError} from '../errors'
import {isValidator} from '../helpers'
import {number, object, string} from '../types'

describe('object', () => {
  const validator = object({})
  const dontTrim = object({}, {trim: false})
  const nestedValidator = object({
    a: number()
  })
  const nestedOptionalValidator = object({
    a: number({optional: true})
  })
  const partial = object(
    {
      a: number(),
      b: string()
    },
    {partial: true}
  )

  it('is a validator', () => {
    expect(isValidator(validator)).toBe(true)
  })
  it('passes with empty object', () => {
    expect(validator({})).toEqual({})
  })
  it('passes with extra props but strips them', () => {
    expect(validator({a: 1})).toEqual({})
  })
  it('passes with extra props but keeps them', () => {
    expect(dontTrim({a: 1})).toEqual({a: 1})
  })
  it('fails with array', () => {
    expect(() => validator([])).toThrowError(ValidationError)
  })
  it('passes with nested validator when matches shape', () => {
    expect(nestedValidator({a: 1})).toEqual({a: 1})
  })
  it("fails with nested validator when doesn't match shape", () => {
    expect(() => nestedValidator({b: 1})).toThrowError(ValidationError)
  })
  it("fails with nested validator when nested value doesn't match", () => {
    expect(() => nestedValidator({a: []})).toThrowError(ValidationError)
  })
  it("fails with nested validator when nested value doesn't match", () => {
    expect(() => nestedValidator({a: []})).toThrowError(ValidationError)
  })
  it('passes with optional nested validator when not included', () => {
    expect(nestedOptionalValidator({})).toEqual({})
  })
  it('passes with optional nested validator when included', () => {
    expect(nestedOptionalValidator({a: 2})).toEqual({a: 2})
  })
  it('partial prop', () => {
    expect(partial({a: 2})).toEqual({a: 2})
    expect(partial({})).toEqual({})
    expect(() => partial({a: 'b'})).toThrowError(ValidationError)
  })
  it('toString()', () => {
    expect(validator.toString()).toBe('{}')
    expect(nestedValidator.toString()).toBe(`{
  a: number
}`)
    expect(nestedOptionalValidator.toString()).toBe(`{
  a: ?number
}`)
  })
  it('toJSONSchema()', () => {
    expect(validator.toJSONSchema()).toEqual({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {}
    })
    expect(nestedValidator.toJSONSchema()).toEqual({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      required: ['a'],
      properties: {
        a: {type: 'number'}
      }
    })
    expect(nestedOptionalValidator.toJSONSchema()).toEqual({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        a: {type: 'number'}
      }
    })
  })
})
