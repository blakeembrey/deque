export class Deque<T> {
  private head = 0
  private tail = 0
  private mask = 1
  private list = new Array<T | undefined>(2)

  constructor(values?: Iterable<T>) {
    if (values) this.extend(values)
  }

  private _resize(size: number, length: number) {
    const { head, mask } = this

    this.head = 0
    this.tail = size
    this.mask = length - 1

    // Optimize resize when list is already sorted.
    if (head === 0) {
      this.list.length = length
      return
    }

    const sorted = new Array<T | undefined>(length)
    for (let i = 0; i < size; i++) sorted[i] = this.list[(head + i) & mask]
    this.list = sorted
  }

  push(value: T): this {
    this.list[this.tail] = value
    this.tail = (this.tail + 1) & this.mask
    if (this.head === this.tail) this._resize(this.list.length, this.list.length << 1)
    return this
  }

  pushLeft(value: T): this {
    this.head = (this.head - 1) & this.mask
    this.list[this.head] = value
    if (this.head === this.tail) this._resize(this.list.length, this.list.length << 1)
    return this
  }

  clear() {
    this.head = 0
    this.tail = 0
  }

  extend(values: Iterable<T>) {
    for (const value of values) this.push(value)
    return this
  }

  extendLeft(values: Iterable<T>) {
    for (const value of values) this.pushLeft(value)
    return this
  }

  peek(index: number) {
    const { head, size, tail, list } = this

    if ((index | 0) !== index || index >= size || index < -size) {
      throw new RangeError('deque index out of range')
    }

    const pos = ((index >= 0 ? head : tail) + index) & this.mask
    return list[pos] as T
  }

  indexOf(needle: T, start = 0) {
    const { head, list, size, mask } = this
    const offset = start >= 0 ? start : start < -size ? 0 : size + start

    for (let i = offset; i < size; i++) {
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
    if (this.head === this.tail) this._resize(this.list.length, this.list.length << 1)
    return this
  }

  get size() {
    return (this.tail - this.head) & this.mask
  }

  pop() {
    if (this.head === this.tail) throw new RangeError('pop from an empty deque')

    this.tail = (this.tail - 1) & this.mask
    const value = this.list[this.tail] as T
    this.list[this.tail] = undefined
    if (this.size < this.mask >>> 1) this._resize(this.size, this.list.length >>> 1)
    return value
  }

  popLeft() {
    if (this.head === this.tail) throw new RangeError('pop from an empty deque')

    const value = this.list[this.head] as T
    this.list[this.head] = undefined
    this.head = (this.head + 1) & this.mask
    if (this.size < this.mask >>> 1) this._resize(this.size, this.list.length >>> 1)
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

    if (this.size < this.mask >>> 1) this._resize(this.size, this.list.length >>> 1)

    return this
  }

  reverse() {
    const { head, tail, size, mask } = this

    for (let i = 0; i < ~~(size / 2); i++) {
      const a = (tail - i - 1) & mask
      const b = (head + i) & mask

      const temp = this.list[a]
      this.list[a] = this.list[b]
      this.list[b] = temp
    }

    return this
  }

  rotate(n = 1) {
    const { head, tail } = this

    if (n === 0 || head === tail) return this

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

    return this
  }

  *entries(): IterableIterator<T> {
    const { head, size, list, mask } = this

    for (let i = 0; i < size; i++) yield list[(head + i) & mask] as T
  }

  keys() {
    return this.entries()
  }

  values() {
    return this.entries()
  }

  [Symbol.iterator]() {
    return this.entries()
  }
}
