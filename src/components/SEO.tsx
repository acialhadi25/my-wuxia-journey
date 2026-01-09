import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

const defaultMeta = {
  title: 'My Wuxia Journey',
  description: 'Embark on an AI-powered cultivation journey in the world of Wuxia. Create your character, unlock golden fingers, and forge your path to immortality.',
  image: '/og-image.png',
  url: 'https://mywuxiajourney.com',
  type: 'website',
};

export function SEO({ 
  title, 
  description, 
  image, 
  url,
  type = 'website' 
}: SEOProps) {
  const meta = {
    title: title ? `${title} | ${defaultMeta.title}` : defaultMeta.title,
    description: description || defaultMeta.description,
    image: image || defaultMeta.image,
    url: url || defaultMeta.url,
    type,
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{meta.title}</title>
      <meta name="title" content={meta.title} />
      <meta name="description" content={meta.description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={meta.type} />
      <meta property="og:url" content={meta.url} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:image" content={meta.image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={meta.url} />
      <meta property="twitter:title" content={meta.title} />
      <meta property="twitter:description" content={meta.description} />
      <meta property="twitter:image" content={meta.image} />

      {/* Additional Meta Tags */}
      <meta name="keywords" content="wuxia, xianxia, cultivation, rpg, ai game, text-based game, browser game, martial arts" />
      <meta name="author" content="My Wuxia Journey" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#0f172a" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={meta.url} />
    </Helmet>
  );
}
