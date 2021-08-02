import React from 'react'
import { Svg, SvgProps } from '@ricefarm/uikitv2'

const RibbonUpMid: React.FC<SvgProps> = (props) => {
  return (
    <Svg viewBox="0 0 142 48" {...props}>
      <rect width="142" height="46" fill="#1baad3" />
      <rect width="142" height="2" fill="#3B2070" />
    </Svg>
  )
}

export default RibbonUpMid
