import {ValidationError} from '../errors'
import {any, array, boolean, dictionary, is, number, object, or, string} from '../types'

describe('combination', () => {
  const complexObjectValidator = object({
    a: object(
      {
        aa: number(),
        ab: array(dictionary(boolean()))
      },
      {optional: true}
    ),
    b: dictionary(array(string())),
    c: or([array(object({ca: array(any())})), boolean()]),
    d: string({optional: true}),
    e: string()
  })

  it('passes case 1', () => {
    const passingValue = {
      a: {
        aa: 1,
        ab: [{aba: true}]
      },
      b: {ba: ['ba0']},
      c: [{ca: []}],
      d: 'd',
      e: 'e'
    }
    expect(complexObjectValidator(passingValue)).toEqual({
      a: {
        aa: 1,
        ab: [{aba: true}]
      },
      b: {ba: ['ba0']},
      c: [{ca: []}],
      d: 'd',
      e: 'e'
    })
  })
  it('passes case 2', () => {
    const passingValue = {
      b: {ba: []},
      c: false,
      e: 'e'
    }
    expect(complexObjectValidator(passingValue)).toEqual({
      b: {ba: []},
      c: false,
      e: 'e'
    })
  })
  it('fails case 3', () => {
    const failingValue = {
      a: {
        aa: 1
      },
      b: {ba: ['ba0']},
      c: [{ca: []}],
      d: 'd',
      e: 'e'
    }
    expect(() => complexObjectValidator(failingValue)).toThrowError(ValidationError)
  })
  it('fails case 4', () => {
    const failingValue = {
      a: {
        aa: 1,
        ab: [{aba: 'abc'}]
      },
      b: {ba: [123]},
      c: [{ca: []}],
      d: 'd',
      e: 'e'
    }
    expect(() => complexObjectValidator(failingValue)).toThrowError(ValidationError)
  })
  it('fails case 5', () => {
    const failingValue = {
      a: {
        aa: 1,
        ab: [{aba: true}]
      },
      b: {ba: ['abc']},
      c: [{ca: []}],
      d: 'd'
    }
    expect(() => complexObjectValidator(failingValue)).toThrowError(ValidationError)
  })
  it('toJSONSchema()', () => {
    const complexObjectValidator = object({
      a: object(
        {
          aa: number({min: 3, max: 5, optional: true}),
          ab: array(dictionary(boolean()))
        },
        {optional: true}
      ),
      b: dictionary(array(string())),
      c: or([array(object({ca: array(any())})), boolean()]),
      d: string({optional: true}),
      e: string({match: /.*/}),
      int: number({strict: true, optional: true}),
      f: is(['a', 23, false])
    })

    expect(complexObjectValidator.toJSONSchema()).toEqual({
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "type": "object",
      "properties": {
        "a": {
          "type": "object",
          "properties": {
            "aa": {
              "minimum": 3,
              "maximum": 5,
              "type": "number",
            },
            "ab": {
              "type": "array",
              "items": {
                "type": "object",
                additionalProperties: {type: 'boolean'}
              }
            },

          },
          required: ['ab']
        },
        "b": {
          "type": "object",
          "additionalProperties": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        },
        c: {
          oneOf: [
            {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "ca": {
                    "type": "array",
                    "items": {
                      "type": "any"
                    }
                  }
                },
                required: ['ca'],
              },
            },
            {
              "type": "boolean"
            }
          ]
        },
        "d": {
          "type": "string"
        },
        e: {
          "type": "string",
          pattern: "/.*/"
        },
        f: {
          "enum": ['a', 23, false]
        },
        int: {
          "type": "number"
        }
      },
      required: ['b', 'c', 'e', 'f']
    })
  })
})
