import "./globals.css";

export const metadata = {
  title: "Ziyaarah API",
  description: "API for managing Umrah and Hajj trips",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
