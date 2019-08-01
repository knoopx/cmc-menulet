const openColor = require('open-color')

module.exports = {
  theme: {
    extend: {},
    colors: {
      transparent: 'transparent',
      inherit: 'inherit',
      ...Object.keys(openColor).reduce(
        (rest, key) => ({
          ...rest,
          ...(Array.isArray(openColor[key])
            ? openColor[key].reduce(
              (colors, color, i) => ({
                ...colors,
                [`${key}-${i}`]: color,
              }),
              {},
            )
            : { [key]: openColor[key] }),
        }),
        {},
      ),
    },
    borderColor: theme => ({
      default: theme('colors.gray-10'),
      ...theme('colors'),
    }),
  },
  variants: {},
  plugins: [],
}
