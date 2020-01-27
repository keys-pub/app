// MIT License
//
// Copyright (c) 2017 Matt Colman
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import * as React from 'react'
import {times} from 'lodash'

type RequestIdleCallbackHandle = any
type RequestIdleCallbackOptions = {
  timeout: number
}

declare global {
  interface Window {
    requestIdleCallback: (
      callback: (any) => void,
      opts?: RequestIdleCallbackOptions
    ) => RequestIdleCallbackHandle
    cancelIdleCallback: (handle: RequestIdleCallbackHandle) => void
  }
}

// [MC] Progressive load list items. By default it loads X rows first, then
// when you scroll to the end of that list it requests to load more (displaying a loader at the end
// of the list by default).
//
// You can also choose to lazily load more rows on each idle frame.
//
// This results in a fast initial render and avoids the complicated nature of a virtualised list.
//
// NOTE - This is a pure component so be sure to pass in new props if you need the list to update.
// By default if the rowCount prop doesn't change then the list won't update.
//
// NOTE - requestIdleCallback is currently not supported by safari.

type Props = {
  className?: string
  idleAmount?: number
  initialAmount?: number
  isActive?: boolean
  progressiveAmount?: number
  renderItem: (index: number) => any
  rowCount: number
  renderLoader?: () => any
  useWindowScroll?: boolean
  onScroll?: (e: any) => void
}

type State = {
  numRenderRows: number
}

class ReactProgressiveList extends React.PureComponent<Props, State> {
  props: Props
  state: State

  static defaultProps = {
    className: undefined,
    idleAmount: 0, // load one extra row on idle by default
    initialAmount: 10,
    isActive: true,
    progressiveAmount: 10,
    renderLoader: () => null,
    useWindowScroll: false,
  }
  requestId: number // eslint-disable-line react/sort-comp
  ref: any
  isLoading = false

  constructor(props: Props, ...args: Array<any>) {
    super(props, ...args)
    const {rowCount, initialAmount, isActive} = props
    this.state = {
      numRenderRows: isActive ? initialAmount : rowCount,
    }
  }

  componentDidMount() {
    const {useWindowScroll} = this.props
    this.progressivelyLoadMore(false)
    const scrollParent = useWindowScroll ? window : this.ref.parentElement
    scrollParent.addEventListener('scroll', this.handleScroll, {
      passive: true,
    })
  }

  handleScroll = e => {
    if (this.props.onScroll) {
      this.props.onScroll(e)
    }
    const {rowCount, progressiveAmount, useWindowScroll} = this.props
    const {numRenderRows} = this.state
    let top, height, scrollHeight, reachedLimit
    if (useWindowScroll) {
      const boundingClientRect = this.ref.getBoundingClientRect()
      top = boundingClientRect.top
      height = boundingClientRect.height
      scrollHeight = window.innerHeight
      reachedLimit = top + height < scrollHeight
    } else {
      top = e.target.scrollTop
      height = e.target.offsetHeight
      scrollHeight = e.target.scrollHeight
      reachedLimit = top + height >= scrollHeight
    }
    if (reachedLimit && numRenderRows !== rowCount && !this.isLoading) {
      this.loadMore(progressiveAmount)
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.rowCount !== this.props.rowCount) {
      this.initializeList(nextProps)
    }
  }

  componentWillUnmount() {
    const {useWindowScroll} = this.props
    if (window.requestIdleCallback) window.cancelIdleCallback(this.requestId)
    const scrollParent = useWindowScroll ? window : this.ref.parentElement
    scrollParent.removeEventListener('scroll', this.handleScroll)
  }

  initializeList(props: Props) {
    const {rowCount, isActive, initialAmount} = props
    if (window.requestIdleCallback) window.cancelIdleCallback(this.requestId)
    this.setState(
      {
        numRenderRows: isActive ? initialAmount : rowCount,
      },
      () => {
        this.progressivelyLoadMore(false)
      }
    )
  }

  progressivelyLoadMore = (immediateLoad: boolean = true) => {
    const {rowCount, idleAmount} = this.props
    const {numRenderRows} = this.state
    if (!window.requestIdleCallback || idleAmount === 0) return
    if (immediateLoad) this.loadMore(idleAmount)
    if (numRenderRows < rowCount) {
      this.requestId = window.requestIdleCallback(this.progressivelyLoadMore)
    }
  }

  scrollToBottom = () => {
    const {useWindowScroll} = this.props
    const scrollParent = useWindowScroll ? window : this.ref.parentElement
    if (scrollParent) {
      scrollParent.scrollTop = scrollParent.scrollHeight
    }
  }

  scrollTop = (n: number) => {
    const {useWindowScroll} = this.props
    const scrollParent = useWindowScroll ? window : this.ref.parentElement
    if (scrollParent) {
      scrollParent.scrollTop = n
    }
  }

  loadMore(amount: number) {
    const {rowCount} = this.props
    if (this.state.numRenderRows >= rowCount) return
    this.isLoading = true
    this.setState(
      state => ({
        numRenderRows: Math.min(state.numRenderRows + amount, rowCount),
      }),
      () => {
        this.isLoading = false
      }
    )
  }

  render() {
    const {className, renderItem, renderLoader, rowCount} = this.props
    const {numRenderRows} = this.state
    return (
      <div
        ref={ref => {
          this.ref = ref
        }}
        className={className}
      >
        {times(numRenderRows, i => renderItem(i))}
        {numRenderRows < rowCount && renderLoader()}
      </div>
    )
  }
}

export default ReactProgressiveList
