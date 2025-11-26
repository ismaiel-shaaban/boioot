import { Metadata } from 'next';

export interface SEOData {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
}

const baseUrl = 'https://boioot.com';
const defaultImage = `${baseUrl}/assets/images/Boioot-logoo.png`;

export function generateMetadata(data: SEOData): Metadata {
  const title = data.title || 'بيوت - منصة العقارات الرائدة في سوريا';
  const description = data.description || 'منصة بيوت للعقارات - ابحث عن العقارات، المشاريع، الإيجار اليومي، والمزيد. أفضل منصة عقارية في سوريا.';

  return {
    title,
    description,
    keywords: data.keywords || 'عقارات، مشاريع عقارية، إيجار يومي، بيوت، سوريا، دمشق، حلب، حمص',
    authors: [{ name: 'بيوت - منصة العقارات' }],
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: title,
      description: description,
      url: data.canonicalUrl || baseUrl,
      siteName: 'بيوت - منصة العقارات',
      images: [
        {
          url: data.ogImage || defaultImage,
          width: 1200,
          height: 630,
        },
      ],
      locale: 'ar_SY',
      type: (data.ogType as 'website' | 'article') || 'website',
      alternateLocale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [data.ogImage || defaultImage],
      site: '@boioot',
      creator: '@boioot',
    },
    alternates: {
      canonical: data.canonicalUrl || baseUrl,
    },
    other: {
      'theme-color': '#007bff',
      'msapplication-TileColor': '#007bff',
    },
  };
}

export function getPageSEOData(route: string): SEOData {
  switch (route) {
    case '/':
    case '/home':
      return {
        title: 'بيوت - منصة العقارات الرائدة في سوريا',
        description: 'منصة بيوت للعقارات - ابحث عن العقارات، المشاريع، الإيجار اليومي، والمزيد. أفضل منصة عقارية في سوريا.',
        keywords: 'عقارات، مشاريع عقارية، إيجار يومي، بيوت، سوريا، دمشق، حلب، حمص',
        canonicalUrl: `${baseUrl}/`,
      };

    case '/projects':
      return {
        title: 'المشاريع العقارية - بيوت',
        description: 'اكتشف أفضل المشاريع العقارية في سوريا. مشاريع سكنية، تجارية، وصناعية من أفضل المطورين.',
        keywords: 'مشاريع عقارية، مشاريع سكنية، مشاريع تجارية، مشاريع صناعية، سوريا',
        canonicalUrl: `${baseUrl}/projects`,
      };

    case '/daily-rent':
      return {
        title: 'الإيجار اليومي - بيوت',
        description: 'ابحث عن أفضل خيارات الإيجار اليومي في سوريا. شقق، فلل، ومكاتب للإيجار اليومي.',
        keywords: 'إيجار يومي، شقق إيجار يومي، فلل إيجار يومي، مكاتب إيجار يومي، سوريا',
        canonicalUrl: `${baseUrl}/daily-rent`,
      };

    case '/community':
      return {
        title: 'مجتمع بيوت - منتدى العقارات',
        description: 'انضم إلى مجتمع بيوت العقاري. شارك خبراتك، اطرح أسئلتك، واقرأ آخر أخبار العقارات.',
        keywords: 'مجتمع عقاري، منتدى عقارات، أخبار عقارية، نصائح عقارية، سوريا',
        canonicalUrl: `${baseUrl}/community`,
      };

    case '/blogs':
      return {
        title: 'مدونة بيوت - أخبار ونصائح العقارات',
        description: 'اقرأ آخر أخبار العقارات، النصائح، والتوجيهات من خبراء بيوت العقاريين.',
        keywords: 'مدونة عقارية، أخبار عقارات، نصائح عقارية، توجيهات عقارية، سوريا',
        canonicalUrl: `${baseUrl}/blogs`,
      };

    default:
      return {
        title: 'بيوت - منصة العقارات الرائدة في سوريا',
        description: 'منصة بيوت للعقارات - ابحث عن العقارات، المشاريع، الإيجار اليومي، والمزيد.',
      };
  }
}

