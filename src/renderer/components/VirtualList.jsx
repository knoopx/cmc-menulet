import React, { useEffect, useState, useRef } from 'react'
import PropTypes from 'prop-types'

const VirtualList = ({
  items,
  itemHeight,
  bufferSize,
  renderItem,
  clientHeight,
  scrollTop,
}) => {
  const totalHeight = itemHeight * items.length
  const visibleItemsCount = Math.ceil(clientHeight / itemHeight) + 1
  const firstItemIndex = Math.floor(scrollTop / itemHeight)
  const firstVisibleItemIndex = Math.max(0, firstItemIndex - bufferSize)
  const lastVisibleItemIndex = Math.min(
    firstItemIndex + bufferSize + visibleItemsCount,
    items.length,
  )
  const visibleItemsOffsetY = Math.min(
    firstVisibleItemIndex * itemHeight,
    totalHeight,
  )
  const visibleItems = items.slice(firstVisibleItemIndex, lastVisibleItemIndex)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: totalHeight - visibleItemsOffsetY,
        transform: `translateY(${visibleItemsOffsetY}px)`,
        overflow: 'hidden',
        contain: 'paint',
      }}
    >
      {visibleItems.map(renderItem)}
    </div>
  )
}

const VirtualListContainer = ({
  items, itemHeight, bufferSize, renderItem,
}) => {
  const container = useRef()
  const [scrollTop, setScrollTop] = useState(0)
  const [clientHeight, setClientHeight] = useState(0)

  const onResize = () => {
    if (container.current) {
      setClientHeight(container.current.clientHeight)
    }
  }

  const onScroll = (e) => {
    setScrollTop(e.target.scrollTop)
  }

  useEffect(() => {
    setScrollTop(container.current.scrollTop)
    setClientHeight(container.current.clientHeight)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <div
      ref={container}
      style={{
        flex: 1,
        flexDirection: 'column',
        maxWidth: '100%',
        overflowY: 'scroll',
        WebkitAppRegion: 'no-drag',
      }}
      onScroll={onScroll}
    >
      {container.current && (
        <VirtualList
          {...{
            items,
            itemHeight,
            bufferSize,
            renderItem,
            clientHeight,
            scrollTop,
          }}
        />
      )}
    </div>
  )
}

VirtualListContainer.propTypes = {
  items: PropTypes.array,
  itemHeight: PropTypes.number.isRequired,
  renderItem: PropTypes.func.isRequired,
  bufferSize: PropTypes.number,
}

VirtualListContainer.defaultProps = {
  bufferSize: 0,
  items: [],
}

export default VirtualListContainer
