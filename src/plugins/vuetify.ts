import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";
import "@/styles/theme.scss";

import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: "hauntedHouse",
    themes: {
      hauntedHouse: {
        dark: true,
        colors: {
          background: "#0d0d0f",
          surface: "#141418",
          primary: "#8b0000",
          secondary: "#4a3728",
          error: "#cf6679",
          info: "#e8e4dc",
          success: "#4caf50",
          warning: "#ffb74d"
        }
      }
    }
  },
  defaults: {
    VBtn: {
      rounded: "lg"
    },
    VCard: {
      rounded: "lg"
    }
  }
});
