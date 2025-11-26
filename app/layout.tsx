import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { AdTypeFilterProvider } from '@/lib/contexts/AdTypeFilterContext';
import { Toaster } from 'react-hot-toast';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'بيوت - منصة العقارات الرائدة في سوريا',
  description: 'منصة بيوت للعقارات - ابحث عن العقارات، المشاريع، الإيجار اليومي، والمزيد. أفضل منصة عقارية في سوريا.',
  keywords: 'عقارات، مشاريع عقارية، إيجار يومي، بيوت، سوريا، دمشق، حلب، حمص',
  authors: [{ name: 'بيوت - منصة العقارات' }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'بيوت - منصة العقارات الرائدة في سوريا',
    description: 'منصة بيوت للعقارات - ابحث عن العقارات، المشاريع، الإيجار اليومي، والمزيد. أفضل منصة عقارية في سوريا.',
    url: 'https://boioot.com/',
    siteName: 'بيوت - منصة العقارات',
    images: [
      {
        url: 'https://boioot.com/assets/images/Boioot-logoo.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'ar_SY',
    type: 'website',
    alternateLocale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'بيوت - منصة العقارات الرائدة في سوريا',
    description: 'منصة بيوت للعقارات - ابحث عن العقارات، المشاريع، الإيجار اليومي، والمزيد.',
    images: ['https://boioot.com/assets/images/Boioot-logoo.png'],
    site: '@boioot',
    creator: '@boioot',
  },
  alternates: {
    canonical: 'https://boioot.com/',
  },
  other: {
    'theme-color': '#007bff',
    'msapplication-TileColor': '#007bff',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* Preconnect to external domains for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" />

        {/* Bootstrap RTL CSS */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.rtl.min.css"
        />

        {/* Font Awesome */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />

        {/* Cairo Font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'بيوت - منصة العقارات',
              url: 'https://boioot.com',
              logo: 'https://boioot.com/assets/images/Boioot-logoo.png',
              description: 'منصة بيوت للعقارات - ابحث عن العقارات، المشاريع، الإيجار اليومي، والمزيد. أفضل منصة عقارية في سوريا.',
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'SY',
                addressRegion: 'دمشق',
              },
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer service',
                availableLanguage: ['Arabic', 'English'],
              },
              sameAs: [
                'https://www.facebook.com/boioot',
                'https://www.instagram.com/boioot',
                'https://www.twitter.com/boioot',
                'https://www.linkedin.com/company/boioot',
              ],
            }),
          }}
        />
      </head>
      <body>
        <AuthProvider>
          <AdTypeFilterProvider>
            {children}
            <Toaster />
          </AdTypeFilterProvider>
        </AuthProvider>
        {/* Bootstrap JS Bundle with Popper */}
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
          async
        />
      </body>
    </html>
  );
}

