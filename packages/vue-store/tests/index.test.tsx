import { describe, expect, it, test, vi } from 'vitest'
// @ts-expect-error We need to import `h` as it's part of Vue's JSX transform
import { defineComponent, h } from 'vue-demi'
import { render, waitFor } from '@testing-library/vue'
import { Store } from '@tanstack/store'
import { userEvent } from '@testing-library/user-event'
import { shallow, useStore } from '../src/index'

const user = userEvent.setup()

describe('useStore', () => {
  it('allows us to select state using a selector', () => {
    const store = new Store({
      select: 0,
      ignored: 1,
    })

    const Comp = defineComponent(() => {
      const storeVal = useStore(store, (state) => state.select)

      return () => <p>Store: {storeVal.value}</p>
    })

    const { getByText } = render(Comp)
    expect(getByText('Store: 0')).toBeInTheDocument()
  })

  it('only triggers a re-render when selector state is updated', async () => {
    const store = new Store({
      select: 0,
      ignored: 1,
    })

    const Comp = defineComponent(() => {
      const storeVal = useStore(store, (state) => state.select)

      const fn = vi.fn()

      return () => {
        fn()
        return (
          <div>
            <p>Number rendered: {fn.mock.calls.length}</p>
            <p>Store: {storeVal.value}</p>
            <button
              onClick={() =>
                store.setState((v) => ({
                  ...v,
                  select: 10,
                }))
              }
            >
              Update select
            </button>
            <button
              onClick={() =>
                store.setState((v) => ({
                  ...v,
                  ignored: 10,
                }))
              }
            >
              Update ignored
            </button>
          </div>
        )
      }
    })

    const { getByText } = render(Comp)
    expect(getByText('Store: 0')).toBeInTheDocument()
    expect(getByText('Number rendered: 1')).toBeInTheDocument()

    await user.click(getByText('Update select'))

    await waitFor(() => expect(getByText('Store: 10')).toBeInTheDocument())
    expect(getByText('Number rendered: 2')).toBeInTheDocument()

    await user.click(getByText('Update ignored'))
    expect(getByText('Number rendered: 2')).toBeInTheDocument()
  })
})

describe('shallow', () => {
  test('should return true for shallowly equal objects', () => {
    const objA = { a: 1, b: 'hello' }
    const objB = { a: 1, b: 'hello' }
    expect(shallow(objA, objB)).toBe(true)
  })

  test('should return false for objects with different values', () => {
    const objA = { a: 1, b: 'hello' }
    const objB = { a: 2, b: 'world' }
    expect(shallow(objA, objB)).toBe(false)
  })

  test('should return false for objects with different keys', () => {
    const objA = { a: 1, b: 'hello' }
    const objB = { a: 1, c: 'world' }
    // @ts-expect-error
    expect(shallow(objA, objB)).toBe(false)
  })

  test('should return false for objects with different structures', () => {
    const objA = { a: 1, b: 'hello' }
    const objB = [1, 'hello']
    // @ts-expect-error
    expect(shallow(objA, objB)).toBe(false)
  })

  test('should return false for one object being null', () => {
    const objA = { a: 1, b: 'hello' }
    const objB = null
    expect(shallow(objA, objB)).toBe(false)
  })

  test('should return false for one object being undefined', () => {
    const objA = { a: 1, b: 'hello' }
    const objB = undefined
    expect(shallow(objA, objB)).toBe(false)
  })

  test('should return true for two null objects', () => {
    const objA = null
    const objB = null
    expect(shallow(objA, objB)).toBe(true)
  })

  test('should return false for objects with different types', () => {
    const objA = { a: 1, b: 'hello' }
    const objB = { a: '1', b: 'hello' }
    // @ts-expect-error
    expect(shallow(objA, objB)).toBe(false)
  })

  test('should return true for shallowly equal maps', () => {
    const objA = new Map([['1', 'hello']])
    const objB = new Map([['1', 'hello']])
    expect(shallow(objA, objB)).toBe(true)
  })

  test('should return false for maps with different values', () => {
    const objA = new Map([['1', 'hello']])
    const objB = new Map([['1', 'world']])
    expect(shallow(objA, objB)).toBe(false)
  })

  test('should return true for shallowly equal sets', () => {
    const objA = new Set([1])
    const objB = new Set([1])
    expect(shallow(objA, objB)).toBe(true)
  })

  test('should return false for sets with different values', () => {
    const objA = new Set([1])
    const objB = new Set([2])
    expect(shallow(objA, objB)).toBe(false)
  })

  test('should return false for dates with different values', () => {
    const objA = new Date('2025-04-10T14:48:00')
    const objB = new Date('2025-04-10T14:58:00')
    expect(shallow(objA, objB)).toBe(false)
  })

  test('should return true for equal dates', () => {
    const objA = new Date('2025-02-10')
    const objB = new Date('2025-02-10')
    expect(shallow(objA, objB)).toBe(true)
  })
})
