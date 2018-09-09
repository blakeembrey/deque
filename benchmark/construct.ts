import Benchmark = require('benchmark')

import { Deque } from '../src'

const DoubleEndedQueue = require('double-ended-queue')
const Denque = require('denque')

const suite = new Benchmark.Suite()

const length = 2000000
const items = Array.from({ length }, (x, i) => i)

suite
  .add('@blakeembrey/deque', () => {
    const deque = new Deque(items)

    for (let i = 0; i < length; i++) deque.pop()
  })
  .add('denque', () => {
    const deque = new Denque(items)

    for (let i = 0; i < length; i++) deque.pop()
  })
  .add('double-ended-queue', () => {
    const deque = new DoubleEndedQueue(items)

    for (let i = 0; i < length; i++) deque.pop()
  })
  .on('cycle', (e: any) => {
    console.log('' + e.target)
  })
  .run()
