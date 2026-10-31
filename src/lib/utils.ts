import { createCn } from "cn/config"

/**
 * `cn` configured for the MobiGo tokens in globals.css. Without this, a custom
 * size such as `text-price` would be read as a text COLOR, and
 * cn("text-white", "text-price") would silently drop `text-white`.
 */
export const cn = createCn({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: ["display", "h1", "h2", "h3", "price-lg", "price", "body", "body-sm", "caption", "overline"],
        },
      ],
      shadow: [{ shadow: ["bar"] }],
      z: ["z-header", "z-bar", "z-float", "z-drawer", "z-modal", "z-popover", "z-toast"],
    },
  },
})
