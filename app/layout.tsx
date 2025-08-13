import "./globals.css";
import { TRPCProvider } from "./_trpc/Provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}