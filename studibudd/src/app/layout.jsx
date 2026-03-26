import "./globals.css";

export const metadata = {
  title: "StudiBudd - Products",
  description:
    "Explore StudiBar, StudiLamp, and StudiBudd. Clean, simple, and made to inspire.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

