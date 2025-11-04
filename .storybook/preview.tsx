import '@mui/material/styles';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import type { Preview } from '@storybook/react';
import { SnackbarProvider } from 'notistack';
import React from 'react';

const theme = createTheme();

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },

  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider maxSnack={3} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
          <Story />
        </SnackbarProvider>
      </ThemeProvider>
    ),
  ],
};

export default preview;
