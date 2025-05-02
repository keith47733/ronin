import { Bebas_Neue, Karla, Lato } from "next/font/google";

export const ronin = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-ronin",
  display: "swap",
});

export const karla = Karla({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-karla",
  display: "swap",
});

export const lato = Lato({
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
  variable: "--font-lato",
  display: "swap",
});
