import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import UserSessionSimulator from "../components/UserSessionSimulator";
import { AppProviders } from "../contexts/AppProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ATS CRM",
  description: "CRM",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProviders>
          {children}
          <UserSessionSimulator />
        </AppProviders>
      </body>
    </html>
  );
}
