import {ValidationError} from '../errors'
import {array, dictionary, number, object, string, tuple} from '../types'

describe('errors', () => {
  const simpleValidator = string()
  const nestedValidator = array(number())
  const deepNestedValidator = object({
    a: object({b: array(tuple([object({c: dictionary(string())})]))})
  })

  it('error has correct meta', () => {
    try {
      simpleValidator(123)
    } catch (err) {
      expect(err instanceof ValidationError).toBe(true)
      expect(err.fn).toBe('string')
      expect(err.path).toEqual([])
    }
  })
  it('error has correct path with simple nesting', () => {
    try {
      nestedValidator(['a'])
    } catch (err) {
      expect(err instanceof ValidationError).toBe(true)
      expect(err.fn).toBe('number')
      expect(err.path).toEqual([0])
    }
  })
  it('error has correct path with deep nesting', () => {
    try {
      deepNestedValidator({
        a: {b: [[{c: {d: '5'}}], [{c: {e: 5}}]]}
      })
    } catch (err) {
      expect(err instanceof ValidationError).toBe(true)
      expect(err.fn).toBe('string')
      expect(err.path).toEqual(['a', 'b', 1, 0, 'c', 'e'])
    }
  })
})
