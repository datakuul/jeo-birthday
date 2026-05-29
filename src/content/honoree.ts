/**
 * Single source of truth for the honoree's static content.
 * Used to seed the database and as typed content for the public site.
 * The family can edit all of this later through the admin area.
 */

export const honoree = {
  fullName: "Mrs. Janet E. Olaniru",
  honorific: "JP",
  shortName: "Janet",
  // Born 26 July 1946 — turning 80 in 2026
  bornOn: "1946-07-26",
  tagline: "Celebrating 80 Years of Grace, Faith & Joy",
  intro:
    "Educator, mother, entrepreneur, and devoted servant of God. For eight decades, Mrs. Janet E. Olaniru has lived a life marked by hard work, unwavering faith, and quiet generosity — shaping generations of young minds and leaving an indelible mark on her family, her church, and her community.",
  // A short epigraph for the hero
  epigraph:
    "Her story is a testament to the power of perseverance, the strength of faith, and the beauty of a life lived in service to others.",
  birthPlace: "Odo-Igbede, Oke-Ere, Yagba West, Kogi State, Nigeria",
};

export const storyChapters = [
  {
    slug: "roots-in-odo-igbede",
    title: "Roots in Odo-Igbede",
    years: "1946 – 1964",
    image: "/images/honoree-smile-bw.jpg",
    quote:
      "From a home of cattle, trade, and toil, she learned that nothing of worth comes without diligence.",
    body: `Janet E. Olaniru was born on the 26th of July, 1946, in the serene clan of Odo-Igbede, nestled in the heart of Oke-Ere town, Yagba West Local Government Area, Kogi State.

She is the proud daughter of the late Mr. and Mrs. Ogundipe Oju, who instilled in her the values of hard work, perseverance, and unwavering faith. Her mother was a renowned dry-fish merchant; her father a miner and trader who kept a significant flock of cattle that were sought after in the local markets.

It was in this home — of livestock, enterprise, and resilience — that Janet first learned the business sense and quiet strength that would define her whole life.`,
  },
  {
    slug: "a-teacher-in-the-making",
    title: "A Teacher in the Making",
    years: "1964 – 1973",
    image: "/images/honoree-2.jpg",
    quote: "She set her sights on greater heights — and never stopped climbing.",
    body: `Janet's educational journey began at Oyi LSMB School in Oke-Ere, where she completed her Standard Seven. Hungry for more, she enrolled at the Teachers' College, Omu-Aran (Wokowomu), graduating in 1973 — ready to embark on a lifelong career dedicated to shaping young minds.

In 1965, at a crusade led by Rev. Ariye at the ECWA Church, Tudun Wada, Kaduna, she gave her life to Christ. That single decision would go on to shape every chapter that followed.`,
  },
  {
    slug: "love-and-family",
    title: "Love & Family",
    years: "1974",
    image: "/images/honoree-4.jpg",
    quote: "A union built on love, commitment, and mutual respect.",
    body: `On the 24th of August, 1974, Janet found love and companionship with Elder/Chief Julius J. Olaniru, whom she married at the ECWA Church in Oke-Ere.

Their union was a beautiful testament to love, commitment, and mutual respect, and together they were blessed with wonderful children — raised with love, discipline, and a strong moral compass to navigate the world with integrity and confidence.`,
  },
  {
    slug: "a-lifelong-calling",
    title: "A Lifelong Calling in Education",
    years: "1973 – 2008",
    image: "/images/honoree-smile-colour.jpg",
    quote:
      "She nurtured the minds and hearts of generations — and her legacy still teaches.",
    body: `With over 35 years of service in education, Mrs. Olaniru's impact on the lives of countless students cannot be overstated. She nurtured the cognitive, affective, and psychomotor growth of generation after generation.

Her leadership reached far beyond the classroom: she served as Headmistress and Head of School across multiple institutions. All the while she pursued her own learning — earning a National Certificate of Education from Bayero University, Kano in 1986, and a Bachelor of Science from Ahmadu Bello University, Zaria in 2000.

She retired voluntarily in 2008, but her legacy in education continues to inspire all who follow.`,
  },
  {
    slug: "faith-and-service",
    title: "Faith & Service",
    years: "1965 – 2018",
    image: "/images/honoree-portrait.jpg",
    quote: "Whatever the role, she served — with devotion and an open heart.",
    body: `Beyond her many achievements, Mrs. Olaniru's heart belongs to her faith. Her commitment to God's work has been steadfast and unwavering.

At the 1st ECWA Church, Oke-Egbe and Oke-Ere, she served faithfully as a Girls' Brigade officer, Women's Choir leader, Financial Secretary, Secretary, and Women Leader. In 2015 she made her pilgrimage to Jerusalem.

At the ECWA DCC level she served as Financial Secretary from 2010 to 2017, displaying exceptional organisational skill and a heart for stewardship — her tenure extended by a further year to guide the newly elected leaders through a smooth transition.`,
  },
  {
    slug: "strength-and-grace",
    title: "Strength & Grace",
    years: "2011 – Today",
    image: "/images/honoree-hero.jpg",
    quote:
      "Through every season, she has shown immense strength, grace, and resilience.",
    body: `On the 25th of January, 2011, her beloved husband passed away, leaving behind a legacy of faith and love that continues to resonate with her.

Through it all, Mrs. Olaniru has shown immense strength, grace, and resilience — raising her family while staying true to her values and faith. A passionate entrepreneur, a true disciplinarian, and a woman of substance, she remains, above all, a mother whose love is matched only by her faith.

Today, as a Justice of the Peace and a matriarch, her story reminds us of the profound impact one life can have on the world around it.`,
  },
];

export const event = {
  title: "The 80th Birthday Celebration",
  venueName: "Pavilion Hall, Crystal Events Centre",
  addressLine: "New Garage Road, opposite Bentos Pharmaceutical",
  city: "Ibadan, Nigeria",
  // Saturday, 25 July 2026, 12 noon (WAT)
  startsAt: "2026-07-25T12:00:00+01:00",
  dressCode:
    "There is an Aso-Ebi (uniform attire): lace & gele for the women, and matching fabric with fila for the men. Kindly indicate in your RSVP if you would like to join the Aso-Ebi. Otherwise, please come beautifully dressed in white & gold.",
  parking: "Complimentary parking is available within the Crystal Events Centre grounds.",
  accessibility:
    "The Pavilion Hall is on the ground floor with step-free access and accessible facilities. Please let us know of any needs in your RSVP and we will be glad to help.",
  giftNote:
    "Your presence is the greatest gift of all. For those who wish to give, a private note can be arranged with the family — please simply reach out to your host.",
  mapQuery: "Crystal Events Centre, New Garage Road, Ibadan, Nigeria",
  venueWebsite: "https://www.crystaleventscenter.com",
};

// Gallery placeholders — real images will be added later by the family via the admin gallery.
const ALBUM_DEFS = [
  { slug: "early-years", title: "Early Years", description: "Childhood and youth in Oke-Ere.", baseYear: 1946, count: 6 },
  { slug: "family", title: "Family", description: "Marriage, children and the generations since.", baseYear: 1974, count: 8 },
  { slug: "career", title: "Career", description: "Over thirty-five years shaping young minds.", baseYear: 1973, count: 6 },
  { slug: "faith-and-community", title: "Faith & Community", description: "A life of service in the church and beyond.", baseYear: 1965, count: 8 },
  { slug: "travels", title: "Travels", description: "Journeys near and far, including Jerusalem in 2015.", baseYear: 1990, count: 4 },
  { slug: "milestones", title: "Milestones", description: "Honours, celebrations and treasured moments.", baseYear: 2000, count: 6 },
];

export const galleryAlbums = ALBUM_DEFS.map((a) => ({
  slug: a.slug,
  title: a.title,
  description: a.description,
  images: Array.from({ length: a.count }).map((_, i) => ({
    placeholder: true,
    caption: `${a.title} · memory ${i + 1}`,
    alt: `A treasured photograph of Mrs. Janet Olaniru — ${a.title} (${i + 1})`,
    year: a.baseYear + i * 3,
    sortOrder: i,
  })),
}));

export const featuredTributes = [
  {
    author: "The ECWA Women Fellowship",
    relationship: "Egbe D.C.C.",
    message:
      "A woman whose contributions to her community, faith, and profession have left an indelible mark on all who know her. We honour her devotion and her unwavering desire to serve others in God's name.",
  },
  {
    author: "Her Former Students",
    relationship: "With gratitude",
    message:
      "You shaped our minds and our character. The lessons you taught us — of diligence, integrity, and faith — we carry to this day. Happy 80th, Headmistress.",
  },
  {
    author: "The Olaniru Family",
    relationship: "Children & Grandchildren",
    message:
      "Mama, you raised us with love, discipline, and a strong moral compass. Your strength is our shelter and your faith is our inheritance. We thank God for eighty beautiful years.",
  },
];
