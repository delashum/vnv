import {SchemaValidator} from './definitions'
import {vnvValidatorSymbol} from './symbols'

export const isValidator = (value: any): value is SchemaValidator => !!value?.[vnvValidatorSymbol]
