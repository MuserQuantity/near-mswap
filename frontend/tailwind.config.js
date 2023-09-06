/** @type {import('tailwindcss').Config} */
module.exports = {
  //配置css生效的文件和目录
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  // purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    // fontSize: {
    //   base: '16px', // 基准字体大小
    // },
    lineHeight: {
      base: '1.5', // 基准行高
    },
    textColor: (theme) => ({
      ...theme('colors'),
      mineTabColor: '#37C1FE',
    }),
    extend: {
      borderWidth: {
        0.5: '0.5px',
      },
      borderRadius: {
        // none: '0',
        // sm: '0.125rem',
        // default: '0.25rem',
        // md: '0.375rem',
        // lg: '0.5rem',
        // full: '9999px',
        // large: '12px 8px',
        // xl: '1rem',
        // '2xl': '1.5rem',
        // '3xl': '2rem',
        // '4px': '4px', // 添加一个默认值
        // '8px': '8px', // 添加一个默认值
        30: '1.875rem', // 添加一个默认值
      },
    },
    backgroundColor: (theme) => ({
      ...theme('colors'),
      homeItemBgColor: '#191919',
      cardItemBgColor: '#2E2E2E',
      homeItemRightBgColor: '#3B3B3B',
      tokenIdColor: '#191919',
    }),
    gradientColorStops: (theme) => ({
      ...theme('colors'),
      gradLeftColor: '#37C1FE',
      gradRightColor: '#F432FE',
      gradSwapTopColor: 'rgba(221, 68, 254, 0.23)',
      gradSwapBottomColor: 'rgba(63, 187, 254, 0.23)',
    }),

    // screens: {
    //   '3xl': '1920px',
    // },
  },
  plugins: [],
}
