// This file loads and exports custom Google Fonts for the app using Next.js built-in font optimization.
// The exported font objects are used to set CSS variables and font-families in your components and global styles.
import { Bebas_Neue, Karla, Lato } from "next/font/google";

// Bebas Neue font for the Ronin logo/title (used as --font-ronin)
export const ronin = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-ronin",
  display: "swap",
});

// Karla font for headings and subtitles (used as --font-karla)
export const karla = Karla({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-karla",
  display: "swap",
});

// Lato font for body text (used as --font-lato)
export const lato = Lato({
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
  variable: "--font-lato",
  display: "swap",
});
