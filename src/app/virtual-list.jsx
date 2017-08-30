import PropTypes from 'prop-types'
import React from 'react'
import { debounce } from 'lodash'
import { observable, computed, action, runInAction } from 'mobx'
import { propTypes, observer } from 'mobx-react'

@observer
class Container extends React.Component {
  @observable isScrolling = false
  @observable scrollTop = 0
  @observable clientHeight = 0

  componentDidMount() {
    this.setScrollTop(this.refs.container.scrollTop)
    this.setClientHeight(this.refs.container.clientHeight)
    window.addEventListener('resize', this.onResize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize)
  }

  onResize() {
    if (this.refs.container) {
      this.setClientHeight(this.refs.container.clientHeight)
    }
  }

  onScroll(e) {
    this.setIsScrolling(true)
    this.scroll(e.target.scrollTop)
  }

  scroll = debounce((scrollTop) => {
    this.setScrollTop(scrollTop)
    this.setIsScrolling(false)
  }, 100)

  @action setIsScrolling(value) {
    this.isScrolling = value
  }

  @action setScrollTop(value) {
    this.scrollTop = value
  }

  @action setClientHeight(value) {
    this.clientHeight = value
  }

  @computed get totalHeight() {
    return this.props.itemHeight * this.props.items.length
  }

  @computed get visibleItemsCount() {
    return Math.ceil(this.clientHeight / this.props.itemHeight) + 1
  }

  @computed get firstItemIndex() {
    return Math.floor(this.scrollTop / this.props.itemHeight)
  }

  @computed get firstVisibleItemIndex() {
    return Math.max(0, this.firstItemIndex - this.props.bufferSize)
  }

  @computed get lastVisibleItemIndex() {
    return Math.min(this.firstItemIndex + this.props.bufferSize + this.visibleItemsCount, this.props.items.length)
  }

  @computed get visibleItemsOffsetY() {
    return Math.min(this.firstVisibleItemIndex * this.props.itemHeight, this.totalHeight)
  }

  @computed get visibleItems() {
    return this.props.items.slice(this.firstVisibleItemIndex, this.lastVisibleItemIndex)
  }

  render() {
    return (
      <div
        ref="container"
        onScroll={this.onScroll}
        style={{ flex: 1, flexDirection: 'column', maxWidth: '100%', overflowY: 'auto' }}
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          height: this.totalHeight - this.visibleItemsOffsetY,
          transform: `translateY(${this.visibleItemsOffsetY}px)`,
          overflow: 'hidden',
          willChange: 'transform',
          contain: 'paint',
        }}
        >
          {this.visibleItems.map((item, index) => this.props.renderItem(item, index, this.isScrolling))}
        </div>
      </div>
    )
  }
}

@observer
export default class VirtualList extends React.Component {
  static propTypes = {
    items: propTypes.arrayOrObservableArray.isRequired,
    itemHeight: PropTypes.number.isRequired,
    renderItem: PropTypes.func.isRequired,
    bufferSize: PropTypes.number.isRequired,
  }

  static defaultProps = {
    bufferSize: 0,
  }

  render() {
    return (
      <div style={{ display: 'flex', flex: 1, flexDirection: 'row', overflow: 'hidden', WebkitAppRegion: 'no-drag' }}>
        <Container {...this.props} />
      </div>
    )
  }
}
