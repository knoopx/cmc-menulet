import { inject, observer } from "mobx-react"
import React from "react"
import OpenColor from "open-color"
import { scaleTime, scaleLinear, scaleBand } from "@vx/scale"
import { GridColumns } from "@vx/grid"
import { extent, max } from "d3-array"
import { Group } from "@vx/group"
import { Point } from "@vx/point"
import { Bar, Line, LinePath, AreaClosed } from "@vx/shape"

import useUniqueId from "../../hooks/useUniqueId"

const Sparkline = ({
  id,
  width,
  height,
  data,
  tickValues,
  stroke,
  ...props
}) => {
  const x = (d) => d.time
  const y = (d) => d.close
  const yVolume = (d) => d.volumefrom
  const xScale = scaleTime({ range: [0, width], domain: extent(data, x) })
  const last = data[data.length - 1]

  const yScale = scaleLinear({
    range: [height - 1, 1],
    domain: extent(data, y),
  })
  const xVolumeScale = scaleBand({
    rangeRound: [0, width],
    domain: data.map(x),
  })

  const yVolumeScale = scaleLinear({
    rangeRound: [0, height],
    domain: [0, max(data, yVolume)],
  })

  const uid = useUniqueId()

  // yEMA20 = data => yScale(data.ema20)
  // yEMA50 = data => yScale(data.ema50)
  return (
    <svg width={width} height={height}>
      <defs>
        <linearGradient
          id={`gradient-${id}-${uid}`}
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop offset="0%" stopColor={stroke} stopOpacity={0.2} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0.0} />
        </linearGradient>
      </defs>
      <Group>
        {data.map((d) => {
          const barHeight = height - yVolumeScale(yVolume(d))
          return (
            <Group key={`bar-${x(d)}`}>
              <Bar
                width={xVolumeScale.bandwidth()}
                height={barHeight}
                x={xScale(x(d))}
                y={height - barHeight}
                fill={OpenColor.gray[7]}
                opacity={0.3}
                data={{ x: x(d), y: yVolume(d) }}
              />
            </Group>
          )
        })}
        <GridColumns
          scale={xScale}
          height={height}
          // strokeDasharray="2,2"
          stroke={OpenColor.gray[7]}
          tickValues={tickValues}
          lineStyle={{ pointerEvents: "none" }}
        />
        <AreaClosed
          data={data}
          x={(value) => xScale(x(value))}
          y={(value) => yScale(y(value))}
          yScale={yScale}
          fill={`url(#gradient-${id})`}
        />
        <LinePath
          data={data}
          x={(value) => xScale(x(value))}
          y={(value) => yScale(y(value))}
          stroke={stroke}
          strokeWidth={2}
        />
        <Line
          stroke={stroke}
          strokeWidth={1}
          strokeDasharray="2,5"
          from={
            new Point({
              x: 0,
              y: yScale(y(last)),
            })
          }
          to={
            new Point({
              x: width,
              y: yScale(y(last)),
            })
          }
          // style={{ vectorEffect: 'non-scaling-stroke' }}
        />
      </Group>
    </svg>
  )
}

Sparkline.defaultProps = {
  width: 300,
  height: 50,
  stroke: OpenColor.blue[5],
  tickValues: [],
}

export default inject("store")(observer(Sparkline))
