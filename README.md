# vnv (very nice validator)

a simple, functional type validator for javascript.

validators are composeable and work like `assert()`

![verynice](https://gitlab.com/hivewire/open-source/vnv/-/raw/master/images/borat.jpg)

## features

- full typescript support
- lightweight (0 dependencies)
- fully tested
- tree shakeable
- really fast [_benchmark coming_]
- generate json schema from definition

## getting started

```typescript
import {string} from 'vnv'

const isString = string()
isString('abc') // returns 'abc'
isString(123) // ValidationError: expected a string but received 123
```

## why should I use this?

Complexity is opt-in. The API starts very simple, but can be combined in any way to handle very complicated validation.

```typescript
import {object, string, number, array} from 'vnv'

const users = [
  {name: 'John Doe', age: 34, children: ['Ben', 'Lisa']},
  {name: 'Jane Doe', age: 50, children: [true]}
]

const isUserList = array(
  object({
    name: string({min: 5, max: 50}),
    age: number({integer: true}),
    children: array(string())
  })
)

isUserList(users) // ValidationError: [1].children.[0] must be a string
```

# docs

## types

vnv current supports the following types:

- [any()](#any)
- [is()](#is)
- [string()](#string)
- [number()](#number)
- [boolean()](#boolean)
- [array(validator)](#dictionary)
- [tuple()](#tuple)
- [object()](#object)
- [dictionary()](#dictionary)

and has the following utilties

- [or()](#or)
- [when()](#when)
- [custom()](#custom)

### `any()`

All validators are configurable and inherit the following options from `any`:

_options_

```json
{
  "nullable": true,
  "optional": false,
  "default": undefined
}
```

_Example_

```typescript
import {any} from 'vnv'

const isAny = any({nullable: false})
isAny(null) // ValidationError

const isAny = any({optional: true})
isAny(undefined) // returns undefined

const isAny = any({default: {hello: 'world'}})
isAny(undefined) // returns {hello: 'world'}
```

### `is()`

_options_

```json
{}
```

_Example_

```typescript
import {is} from 'vnv'

const isOneOfThose = is(['a', 'b', 123, false])
isOneOfThose('a') // returns 'a'
isOneOfThose(false) // returns false
isOneOfThose('c') // ValidationError: must be either 'a' | 'b' | 123 | false
```

### `string()`

_options_

```json
{
  "min": Infinity,
  "max": 0,
  "match": undefined /* Regex to be matched against */,
  "allowEmpty": true,
  "is": undefined
}
```

_Example_

```typescript
import {string} from 'vnv'

const isString = string()
isString('abc') // returns 'abc'

const isEmail = string({match: /email matcher here/})
isEmail('notanemail') // ValidationError

const isNonEmptyString = string({allowEmpty: false})
isNonEmptyString('') // ValidationError

const isInList = string({is: ['a', 'b', 'c']})
isInList('a') // returns 'a'
isInList('d') // ValidationError
```

### `number()`

_options_

```json
{
  "max": Infinity,
  "min": -Infinity,
  "strict": false
}
```

_Example_

```typescript
import {number} from 'vnv'

const isNumber = number()
isNumber(123) // returns 123
isNumber('456') // returns 456

const isNumber = number({strict: true})
isNumber('123') // ValidationError
```

### `boolean()`

_options_

```json
{}
```

_Example_

```typescript
import {boolean} from 'vnv'

const isBoolean = boolean()
isBoolean(false) // returns false
isBoolean(1) // ValidationError
```

### `array(validator)`

_options_

```json
{
  "minLength": 0,
  "maxLength": Infinity
}
```

_Example_

```typescript
import {array} from 'vnv'

const isArray = array(any())
isArray([]) // returns []

const isStringArray = array(string())
isStringArray(['a']) // returns ['a']
isStringArray(['a', 123]) // ValidationError: expected a string at [1] but received 123
```

### `tuple(...validators)`

_options_

```json
{}
```

_Example_

```typescript
import {tuple} from 'vnv'

const isTuple = tuple([string(), number()])
isTuple(['a', 1]) // returns ['a', 1]
isTuple([2, 1]) // ValidationError: expected a string at [0] but received 2

const isTupleWithOptional = tuple([string(), string(), string({optional: true})])
isTuple(['a', 'b', 'c']) // returns ['a', 'b', 'c']
isTuple(['a', 'b']) // returns ['a', 'b']
```

### `object({[key]: validator})`

_options_

```json
{
  "trim": true // remove extra keys that aren't part of the validator
}
```

_Example_

```typescript
import {object, string} from 'vnv'

const isPerson = object({
  name: string(),
  type: string({is: ['doctor', 'butcher']})
})

isPerson({
  name: 'John',
  type: 'doctor'
}) // returns {name: 'John', type: 'doctor'}

isPerson({
  name: 'Greg',
  type: 'butcher',
  age: 32
}) // returns {name: 'Greg', type: 'butcher'} *note that age was trimmed from value
isPerson({
  name: 'Linda',
  type: 'athlete'
}) // ValidationError: type must be one of the following values doctor,butcher

const nestedObjects = object({
  id: string(),
  config: object({
    a: string(),
    b: number({optional: true})
  })
})
```

### `dictionary(validator)`

_options_

```json
{}
```

_Example_

```typescript
import {dictionary} from 'vnv'

const isDictionary = dictionary(string())
isDictionary({
  a: 'a',
  b: 'b'
}) // returns {a: 'a', b: 'b'}
isDictionary({
  a: 'a',
  b: 2
}) // ValidationError: expected a string at b but received 2
```

### `or(validator[])`

_options_

```json
{}
```

_Example_

```typescript
import {or} from 'vnv'

const isNumberOrString = or([string(), number()])
isNumberOrString(123) // returns 123
isNumberOrString('abc') // returns 'abc'
isNumberOrString({}) // ValidationError: value must be one of the following types string, number
```

### `when(id,validator[])`

_options_

```json
{}
```

_Example_

```typescript
import {when, object, is, string, number} from 'vnv'

const doctorValidator = object({
  hospital: string(),
  type: is(['surgeon', 'nurse'])
})
const lawyerValidator = object({
  school: string(),
  type: is(['litigator', 'defense'])
})

const isPerson = object({
  type: is(['doctor', 'lawyer'], {id: 'type'}), // you must give an id to the attribute you perform conditional logic on
  age: number(),
  attributes: when('type', [
    // use that same id in the when
    [is('doctor'), doctorValidator],
    [is('lawyer'), lawyerValidator]
  ])
})

isPerson({
  type: 'doctor',
  age: 54,
  attributes: {
    hospital: 'ABC',
    type: 'surgeon'
  }
}) // returns the object passed in ^

isPerson({
  type: 'lawyer',
  age: 54,
  attributes: {
    hospital: 'ABC', // since type is lawyer, this is the wrong attributes body, will fail
    type: 'surgeon'
  }
}) // ValidationError: attributes.school is required
```

### `custom(value => boolean)`

_options_

```json
{
  "toString": () => string // specify how to display this type in error messages
}
```

_Example_

```typescript
import {custom, CustomValidationError} from 'vnv'

const isEmail = custom((value) => {
  if (typeof value !== 'string') throw CustomValidationError('must be a string')
  if (!/...regex to match email/.test(value)) throw CustomValidationError('must be an email')
  return value
})

isEmail('test@test.com') // returns 'test@test.com'
isEmail(123) // ValidationError: must be a string
isEmail('abc') // ValidationError: must be an email
```

## JSON Schema

You can take any vnv definition and generate JSON Schema from it. example:

```
const isUserList = array(
  object({
    name: string({min: 5, max: 50, optional: true}),
    age: number({integer: true, optional: false  }),
    dogs: array(string(), {optional: false}),
    car: dictionary(string()),
    shirt: object({graphic: boolean()}, {optional: true})
  })
)

isUserList.toJSONSchema()
```

resulting JSON Schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "name": {
        "type": "string",
        "minLength": 5,
        "maxLength": 50
      },
      "age": {
        "type": "number"
      },
      "dogs": {
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "car": {
        "type": "object",
        "additionalProperties": {
          "type": "string"
        }
      },
      "shirt": {
        "type": "object",
        "properties": {
          "graphic": {
            "type": "boolean"
          }
        },
        "required": ["graphic"]
      }
    },
    "required": ["age", "dogs", "car"]
  }
}
```
