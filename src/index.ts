export class Node<T> {
  value: T
  next: Node<T>
  prev: Node<T>

  constructor(value: T) {
    this.value = value
    // Allow a circular node to be created.
    this.next = this
    this.prev = this
  }

  append(node: Node<T>) {
    node.next = this.next
    this.next.prev = node
    node.prev = this
    this.next = node
  }

  detach() {
    this.next.prev = this.prev
    this.prev.next = this.next
    this.next = this
    this.prev = this
  }
}

export class Deque<T> {
  head: Node<T> | undefined

  constructor(values?: Iterable<T>) {
    if (values) this.extend(values)
  }

  push(value: T): this {
    const node = new Node(value)

    if (this.head) {
      // Append to "tail".
      this.head.prev.append(node)
    } else {
      // First item is always "head".
      this.head = node
    }

    return this
  }

  pushLeft(value: T): this {
    const node = new Node(value)
    // Append to end of list.
    if (this.head) this.head.prev.append(node)
    // Rotate list to start at current node ("left").
    this.head = node
    return this
  }

  clear() {
    this.head = undefined
  }

  extend(values: Iterable<T>) {
    for (const value of values) this.push(value)
  }

  extendLeft(values: Iterable<T>) {
    for (const value of values) this.pushLeft(value)
  }

  peek(index: number) {
    let item = this.head
    let i = 0

    if (!item) throw new RangeError('deque index out of range')
    if (index === 0) return item.value

    if (index > 0) {
      while (i < index) {
        item = item.next
        if (item === this.head) break
        i += 1
      }
    } else {
      while (i > index) {
        item = item.prev
        i -= 1
        if (item === this.head) break
      }
    }

    if (i !== index) throw new RangeError('deque index out of range')

    return item.value
  }

  indexOf(needle: T) {
    let index = 0

    for (const value of this.values()) {
      if (value === needle) return index
      index += 1
    }

    return -1
  }

  has(needle: T) {
    for (const value of this.values()) {
      if (value === needle) return true
    }

    return false
  }

  insert(index: number, value: T) {
    const node = new Node(value)
    let item = this.head

    if (!item) {
      this.head = node
      return this
    }

    // Update `head` pointer when inserting as first element.
    if (index === 0) this.head = node

    for (let i = 0; i < index; i++) {
      item = item.next
      if (item === this.head) break
    }

    item.prev.append(node)
    return this
  }

  pop() {
    const head = this.head

    if (!head) throw new RangeError('pop from an empty deque')

    if (head.prev === head) {
      this.head = undefined
      return head.value
    }

    const prev = head.prev
    prev.detach()
    return prev.value
  }

  popLeft() {
    const head = this.head

    if (!head) throw new RangeError('pop from an empty deque')

    if (head.prev === head) {
      this.head = undefined
      return head.value
    }

    const next = head.next
    head.detach()
    this.head = next
    return head.value
  }

  delete(index: number) {
    let item = this.head

    if (!item || index < 0) throw new RangeError('deque index out of range')

    // Update `head` pointer when removing first element.
    if (index === 0) this.head = item.next

    for (let i = 0; i < index; i++) {
      item = item.next
      if (item === this.head) throw new RangeError('deque index out of range')
    }

    item.detach()

    return item.value
  }

  reverse() {
    const head = this.head
    let item = head

    if (!item) return

    while (true) {
      const next: Node<T> = item.next
      item.next = item.prev
      item.prev = next
      if (next === head) break
      item = next
    }

    this.head = item

    return this
  }

  rotate(n = 1) {
    let item = this.head

    if (!item) return this

    if (n > 0) {
      for (let i = 0; i < n; i++) item = item.prev
    } else {
      for (let i = 0; i > n; i--) item = item.next
    }

    this.head = item

    return this
  }

  *values() {
    let item = this.head

    if (!item) return

    do {
      yield item.value
      item = item.next
    } while (item !== this.head)
  }

  [Symbol.iterator]() {
    return this.values()
  }
}
