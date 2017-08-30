import { inject, observer } from 'mobx-react'

import React from 'react'
import OpenColor from 'open-color'
import { scaleTime, scaleLinear, scaleBand } from '@vx/scale'
import { extent, max } from 'd3-array'
import { Group } from '@vx/group'
import { Bar, LinePath } from '@vx/shape'

@inject('store')
@observer
export default class Sparkline extends React.Component {
  static defaultProps = {
    width: 300,
    height: 50,
  }

  render() {
    const { width, height, data, ...props } = this.props

    return (
      <svg width={width} height={height} >
        <Group>
          {data.map((d) => {
            const barHeight = height - this.yVolumeScale(this.yVolume(d))
            return (
              <Group key={`bar-${this.x(d)}`}>
                <Bar
                  width={this.xVolumeScale.bandwidth()}
                  height={barHeight}
                  x={this.xScale(this.x(d))}
                  y={height - barHeight}
                  fill={OpenColor.gray[7]}
                  opacity={0.3}
                  data={{ x: this.x(d), y: this.yVolume(d) }}
                />
              </Group>
            )
          })}
        </Group>
        <Group>
          <LinePath
            data={data}
            x={this.x}
            y={this.y}
            xScale={this.xScale}
            yScale={this.yScale}
            stroke={OpenColor.blue[5]}
            strokeWidth={2}
          />
        </Group>
      </svg>
    )
  }

  get xScale() {
    const { width, data } = this.props
    return scaleTime({ range: [0, width], domain: extent(data, this.x) })
  }

  get yScale() {
    const { height, data } = this.props
    return scaleLinear({ range: [height - 1, 1], domain: extent(data, this.y) })
  }

  get xVolumeScale() {
    const { width, data } = this.props
    return scaleBand({
      rangeRound: [0, width],
      domain: data.map(this.x),
    })
  }

  get yVolumeScale() {
    const { height, data } = this.props
    return scaleLinear({ rangeRound: [0, height], domain: [0, max(data, this.yVolume)] })
  }

  x = data => data.time
  y = data => data.close
  yVolume = data => data.volumefrom
  // yEMA20 = data => this.yScale(data.ema20)
  // yEMA50 = data => this.yScale(data.ema50)
}
