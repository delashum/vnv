import {isValidator} from '../helpers'

describe('tests helper functions', () => {
  it('isValidator()', () => {
    expect(isValidator(null)).toBe(false)
    expect(isValidator({})).toBe(false)
    expect(isValidator([])).toBe(false)
    expect(isValidator(() => {})).toBe(false)
    expect(isValidator((arg: any) => {})).toBe(false)
  })
})
