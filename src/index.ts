export class Deque<T> {
  head = 0
  tail = 0
  mask = 3
  list = new Array(4)

  constructor(values?: Iterable<T>) {
    if (values) this.extend(values)
  }

  private _grow() {
    this._sort()
    this.list.length *= 2
    this.mask = (this.mask << 1) | 1
  }

  private _shrink() {
    this._sort()
    this.list.length /= 2
    this.mask = this.mask >>> 1
  }

  private _sort() {
    const { list, head, tail, mask } = this
    const size = head === tail ? list.length : (tail - head) & mask

    this.head = 0
    this.tail = size

    if (head === 0) return

    const sorted: T[] = new Array(mask + 1)
    for (let i = 0; i < size; i++) sorted[i] = list[(head + i) & mask]
    this.list = sorted
  }

  push(value: T): this {
    this.list[this.tail] = value
    this.tail = (this.tail + 1) & this.mask
    if (this.tail === this.head) this._grow()
    return this
  }

  pushLeft(value: T): this {
    this.head = (this.head - 1) & this.mask
    this.list[this.head] = value
    if (this.head === this.tail) this._grow()
    return this
  }

  clear() {
    this.head = 0
    this.tail = 0
  }

  extend(values: Iterable<T>) {
    for (const value of values) this.push(value)
  }

  extendLeft(values: Iterable<T>) {
    for (const value of values) this.pushLeft(value)
  }

  peek(index: number) {
    const { head, size, tail, list } = this

    if ((index | 0) !== index || index >= size || index < -size) {
      throw new RangeError('deque index out of range')
    }

    const pos = ((index >= 0 ? head : tail) + index) & this.mask
    return list[pos]
  }

  indexOf(needle: T) {
    const { head, list, size, mask } = this

    for (let i = 0; i < size; i++) {
      if (list[(head + i) & mask] === needle) return i
    }

    return -1
  }

  has(needle: T) {
    const { head, list, size, mask } = this

    for (let i = 0; i < size; i++) {
      if (list[(head + i) & mask] === needle) return true
    }

    return false
  }

  insert(index: number, value: T) {
    const pos = (this.head + index) & this.mask
    let cur = this.tail

    // Increase tail position by 1.
    this.tail = (this.tail + 1) & this.mask

    // Shift items forward 1 to make space for insert.
    while (cur !== pos) {
      const prev = (cur - 1) & this.mask
      this.list[cur] = this.list[prev]
      cur = prev
    }

    this.list[pos] = value
    if (this.head === this.tail) this._grow()
    return this
  }

  get size() {
    return (this.tail - this.head) & this.mask
  }

  pop() {
    if (this.head === this.tail) throw new RangeError('pop from an empty deque')

    this.tail = (this.tail - 1) & this.mask
    const value = this.list[this.tail]
    this.list[this.tail] = undefined
    if (this.size <= this.list.length >>> 2) this._shrink()
    return value
  }

  popLeft() {
    if (this.head === this.tail) throw new RangeError('pop from an empty deque')

    const value = this.list[this.head]
    this.list[this.head] = undefined
    this.head = (this.head + 1) & this.mask
    if (this.size <= this.list.length >>> 2) this._shrink()
    return value
  }

  delete(index: number) {
    if (index >= this.size || index < 0) {
      throw new RangeError('deque index out of range')
    }

    const pos = (this.head + index) & this.mask
    let cur = pos

    // Shift items backward 1 to erase position.
    while (cur !== this.tail) {
      const next = (cur + 1) & this.mask
      this.list[cur] = this.list[next]
      cur = next
    }

    // Decrease tail position by 1.
    this.tail = (this.tail - 1) & this.mask

    if (this.size <= this.list.length >>> 2) this._shrink()

    return this
  }

  reverse() {
    const { head, tail, size, list, mask } = this

    for (let i = 0; i < ~~(size / 2); i++) {
      const a = (tail - i - 1) & mask
      const b = (head + i) & mask

      const temp = this.list[a]
      this.list[a] = this.list[b]
      this.list[b] = temp
    }
  }

  rotate(n = 1) {
    const { head, tail } = this

    if (n === 0 || head === tail) return

    this.head = (head - n) & this.mask
    this.tail = (tail - n) & this.mask

    if (n > 0) {
      for (let i = 1; i <= n; i++) {
        const a = (head - i) & this.mask
        const b = (tail - i) & this.mask

        this.list[a] = this.list[b]
        this.list[b] = undefined
      }
    } else {
      for (let i = 0; i > n; i--) {
        const a = (tail - i) & this.mask
        const b = (head - i) & this.mask

        this.list[a] = this.list[b]
        this.list[b] = undefined
      }
    }
  }

  *values() {
    const { head, size, list, mask } = this

    for (let i = 0; i < size; i++) yield list[(head + i) & mask]
  }

  [Symbol.iterator]() {
    return this.values()
  }
}
