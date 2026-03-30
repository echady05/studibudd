import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "StudiBudd",
  description:
    "Your Study Buddy Made to Motivate",
    icons: {icon: 'pictures/tabicon.png',
    },
  };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body><Providers>{children}</Providers></body>
    </html>
  );
  <head>
  <link
  href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap"
  rel="stylesheet"
/>
</head>
}

