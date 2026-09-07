export function personSchema(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "William Nisole",
    jobTitle: "Front-End Developer",
    url: siteUrl,
    sameAs: [
      "https://github.com/wizai",
      "https://www.linkedin.com/in/william-n-01153a116",
    ],
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export interface ProjectSummary {
  title: string;
  tagline: string;
  url: string;
}

export function projectListSchema(siteUrl: string, projects: ProjectSummary[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Selected work",
    url: `${siteUrl}/projects`,
    hasPart: projects.map((project) => ({
      "@type": "CreativeWork",
      name: project.title,
      description: project.tagline,
      url: project.url,
    })),
  };
}

export interface ProjectDetailData {
  title: string;
  tagline: string;
  context: string;
  timeline: string;
  pubDate: Date;
  stack: string;
  websiteUrl: string;
  coverImageUrl: string;
  url: string;
  siteUrl: string;
  authorName: string;
}

export function projectDetailSchema(data: ProjectDetailData) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: data.title,
    headline: data.title,
    description: data.tagline,
    image: data.coverImageUrl,
    datePublished: data.pubDate.toISOString(),
    url: data.url,
    keywords: data.stack,
    temporalCoverage: data.timeline,
    about: {
      "@type": "Organization",
      name: data.context,
      url: data.websiteUrl,
    },
    author: {
      "@type": "Person",
      name: data.authorName,
      url: data.siteUrl,
    },
  };
}