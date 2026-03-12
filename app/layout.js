import "./globals.css";

export const metadata = {
  title: "korsanfilmci — Film ve Dizi izle",
  description: "Ücretsiz film ve dizi izle. Minimalist streaming.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
