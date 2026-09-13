import './globals.css';

export const metadata = {
  title: 'Backlog Killer — PW Backlog War Room',
  description: 'Turn your Physics Wallah lecture backlog into a day-by-day kill plan. Built for Lakshya NEET 2027 aspirants.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Mukta:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
