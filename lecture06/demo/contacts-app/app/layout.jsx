export const metadata = {
  title: 'Contacts App',
  description: 'Demo aplikacja — lista kontaktow',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
