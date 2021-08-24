import {ValidationError} from '../errors'
import {any, boolean, is, number, object, string, when} from '../types'

describe('when', () => {
  const whenIsValidator = object({
    type: is(['a', 'b', 'c'], {id: 'type'}),
    config: when('type', [
      [is('a'), object({a: boolean()})],
      [is('b'), object({b: boolean()})]
    ])
  })
  const optionalWhen = object({
    type: is(['a', 'b', 'c'], {id: 'type'}),
    config: when(
      'type',
      [
        [is('a'), object({a: boolean()})],
        [is('b'), object({b: boolean()})]
      ],
      {optional: true}
    )
  })

  it('works with passing data', () => {
    whenIsValidator({type: 'a', config: {a: true}})
    whenIsValidator({type: 'b', config: {b: true}})
  })

  it('fails with incorrect id type', () => {
    expect(() => whenIsValidator({type: 'a', config: {b: true}})).toThrowError(ValidationError)
    expect(() => whenIsValidator({type: 'a', config: {a: 123}})).toThrowError(ValidationError)
    expect(() => whenIsValidator({type: 'b', config: {a: 'string'}})).toThrowError(ValidationError)
  })

  it('throws config error with unspecified type', () => {
    expect(() => whenIsValidator({type: 'c', config: {b: true}})).toThrowError(Error)
  })

  it('optional when works', () => {
    optionalWhen({type: 'a'})
  })

  const whensStringValidator = object({
    config: when('type', [
      [is('abc'), object({a: boolean()})],
      [any(), object({b: boolean()})]
    ]),
    type: string({id: 'type'})
  })
  const whensNumberValidator = object({
    config: when('type', [
      [is(123), object({a: boolean()})],
      [any(), object({b: boolean()})]
    ]),
    type: number({id: 'type'})
  })
  const whensBooleanValidator = object({
    config: when('type', [
      [is(true), object({a: boolean()})],
      [any(), object({b: boolean()})]
    ]),
    type: boolean({id: 'type'})
  })

  it('works with passing data all types', () => {
    whensStringValidator({type: 'abc', config: {a: true}})
    whensStringValidator({type: 'abcdefghijkl', config: {b: true}})
    whensNumberValidator({type: 321, config: {b: false}})
    whensNumberValidator({type: 123, config: {a: false}})
    whensBooleanValidator({type: false, config: {b: false}})
    whensBooleanValidator({type: true, config: {a: false}})
  })

  it('fails with incorrect all type', () => {
    expect(() => whensStringValidator({type: 'abc', config: {b: true}})).toThrowError(ValidationError)
    expect(() => whensStringValidator({type: 'cba', config: {a: 123}})).toThrowError(ValidationError)
    expect(() => whensNumberValidator({type: 321, config: {a: 'string'}})).toThrowError(ValidationError)
    expect(() => whensNumberValidator({type: 123, config: {b: 'string'}})).toThrowError(ValidationError)
    expect(() => whensBooleanValidator({type: false, config: {a: true}})).toThrowError(ValidationError)
    expect(() => whensBooleanValidator({type: true, config: {b: 'false'}})).toThrowError(ValidationError)
  })

  const nestedWhen = object({
    config: object({
      prop: when('type', [
        [is('john smith'), string()],
        [is('jane smith'), number()]
      ])
    }),
    type: string({id: 'type'})
  })

  xit('nested works', () => {
    // this use case is broken
    nestedWhen({type: 'john smith', config: {prop: 'abc'}})
    nestedWhen({type: 'jane smith', config: {prop: 123}})
    expect(() => nestedWhen({type: 'jane smith', config: {prop: 'abc'}})).toThrowError(ValidationError)
    expect(() => nestedWhen({type: 'john smith', config: {prop: 123}})).toThrowError(ValidationError)
  })

  it('toJSONSchema', () => {
    const doctorValidator = object({
      hospital: string(),
      kindOf: is(['surgeon', 'nurse'])
    })
    const lawyerValidator = object({
      school: string(),
      kindOf: is(['litigator', 'defense'])
    })
    const isPerson = object({
      profession: is(['doctor', 'lawyer'], {id: 'profession'}), // you must give an id to the attribute you perform conditional logic on
      age: number(),
      attributes: when('profession', [
        // use that same id in the when
        [is('doctor'), doctorValidator],
        [is('lawyer'), lawyerValidator]
      ])
    })
    expect(isPerson.toJSONSchema()).toEqual({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        profession: {
          enum: ['doctor', 'lawyer']
        },
        age: {type: 'number'},
        attributes: {
          oneOf: [
            {
              type: 'object',
              properties: {
                hospital: {type: 'string'},
                kindOf: {enum: ['surgeon', 'nurse']}
              },
              required: ['hospital', 'kindOf']
            },
            {
              type: 'object',
              properties: {
                school: {type: 'string'},
                kindOf: {enum: ['litigator', 'defense']}
              },
              required: ['school', 'kindOf']
            }
          ]
        }
      },
      required: ['profession', 'age', 'attributes']
    })
  })
})
