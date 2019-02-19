import Benchmark = require('benchmark')

import { Deque } from '../src'

const DoubleEndedQueue = require('double-ended-queue')
const Denque = require('denque')

const suite = new Benchmark.Suite()

const length = 2000000
const items = Array.from({ length }, (x, i) => i)

const deque = new Deque(items)
const dequeRotate = new Deque(items)
const denque = new Denque(items)
const doubleEndedQueue = new DoubleEndedQueue(items)

suite
  .add('@blakeembrey/deque', () => {
    deque.push(deque.popLeft())
  })
  .add('@blakeembrey/deque rotate', () => {
    dequeRotate.rotate(-1)
  })
  .add('denque', () => {
    denque.push(denque.shift())
  })
  .add('double-ended-queue', () => {
    doubleEndedQueue.push(doubleEndedQueue.shift())
  })
  .on('cycle', (e: any) => {
    console.log('' + e.target)
  })
  .run()
