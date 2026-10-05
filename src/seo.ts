export const siteUrl = "https://saadar.dev/";
export const profileSchema = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": `${siteUrl}#profile`,
  url: siteUrl,
  name: "Saad AR — AI, Web & Mobile Developer",
  mainEntity: {
    "@type": "Person",
    "@id": `${siteUrl}#saad`,
    name: "Saad AR",
    alternateName: "ML-CoderX",
    url: siteUrl,
    image: `${siteUrl}images/avatar.png`,
    description: "Computer Science student and developer building machine learning, web, and mobile applications.",
    knowsAbout: ["Machine learning", "Web development", "Mobile application development", "Python", "Angular", "Ionic"],
    sameAs: ["https://github.com/ML-CoderX", "https://www.linkedin.com/in/saad-beary/"],
  },
};
