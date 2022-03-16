import React from 'react';
import Theme from '@sweatpants/theme';
import Box from '@sweatpants/box';
/* @ts-ignore */
// import REACT_DATA from '__DELVER_REACT__';
// import CSS_DATA from '__DELVER_CSS__';

const theme = {
  space: {
    1000: '10rem',
    900: '4rem',
    700: '3rem',
    600: '2rem',
    500: '1.5rem',
    400: '1rem',
    300: '0.75rem',
    200: '0.5rem',
    100: '0.2rem',
    0: '0rem'
  },
  fontSizes: {
    800: '3.5rem',
    700: '2.75rem',
    600: '2rem',
    500: '1.5rem',
    400: '1.25rem',
    300: '1.125rem',
    200: '1rem',
    100: '0.875rem',
    default: '16px'
  },
  colors: {
    black: '#000000',
    white: '#ffffff',
    blue: '#1273e6',
    gray: {
      100: '#f5f8fa',
      200: '#ebf0f5',
      300: '#d9e0e6',
      400: '#c5ced6',
      500: '#a2adb8',
      600: '#818e9a',
      700: '#626f7a',
      800: '#46525c',
      900: '#39444d',
      1000: '#2c353d',
      1100: '#1A1C1F'
    }
  }
};

function maybeImport(path: string) {
  try {
    require.resolve(path);
    return require(path);
  } catch (e) {
    return false;
  }
}

const cssData = maybeImport('__DELVER_CSS__');
const reactData = maybeImport('__DELVER_REACT__') || [];

function App() {
  const componentCount = reactData.length;

  return (
    <Theme theme={theme}>
      <Box maxWidth="1200px" my="900" mx="auto">
        <main>
          <Box>
            <Box>Components</Box>
            <Box>{componentCount}</Box>
          </Box>
        </main>
      </Box>
    </Theme>
  );
}

export default App;
