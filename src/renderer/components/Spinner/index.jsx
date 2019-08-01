import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './styles.css'

const Spinner = ({ size, className, ...props }) => (
  <div className={styles.spinner} style={{ width: size, height: size }} {...props}>
    <div className={classNames([styles.first, className])} />
    <div className={classNames([styles.second, className])} />
    <div className={classNames([styles.third, className])} />
  </div>
)

Spinner.propTypes = {
  size: PropTypes.number.isRequired,
}

export default Spinner
