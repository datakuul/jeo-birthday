import type { Metadata } from "next";
import { formatDate } from "@/lib/utils";
import { event, honoree } from "@/content/honoree";
import { ProgrammeDeck, type Movement } from "@/components/programme-deck";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "The Programme",
  description:
    "The order of ceremony for the 80th birthday celebration of Mrs. Janet E. Olaniru, JP — Saturday, 25 July 2026 in Ibadan.",
};

// The order of ceremony, grouped into movements for an unhurried, ceremonial read.
const MOVEMENTS: Movement[] = [
  {
    numeral: "I",
    name: "Arrival & Procession",
    range: "1:00 – 1:45 pm",
    items: [
      {
        time: "1:00 – 1:30 pm",
        title: "Arrival of Guests",
        detail:
          "Red carpet, live instrumental music, and ushers on hand to receive our guests.",
        duration: "30 mins",
      },
      {
        time: "1:30 – 1:40 pm",
        title: "Arrival of the Celebrant & Family",
        duration: "10 mins",
      },
      {
        time: "1:40 – 1:45 pm",
        title: "Processional into the Hall",
        duration: "5 mins",
      },
    ],
  },
  {
    numeral: "II",
    name: "Opening & Welcome",
    range: "1:45 – 2:05 pm",
    items: [
      { time: "1:45 – 1:50 pm", title: "Opening Prayer", duration: "5 mins" },
      {
        time: "1:50 – 1:55 pm",
        title: "Welcome Address by the MC",
        duration: "5 mins",
      },
      {
        time: "1:55 – 2:05 pm",
        title: "Recognition of Special Guests",
        detail: "Traditional rulers, clergy, family and friends.",
        duration: "10 mins",
      },
    ],
  },
  {
    numeral: "III",
    name: "Tributes & Honours",
    range: "2:05 – 3:00 pm",
    items: [
      {
        time: "2:05 – 2:15 pm",
        title: "Biography of Mrs. J. E. Olaniru (JP)",
        duration: "10 mins",
      },
      {
        time: "2:15 – 2:25 pm",
        title: "Tribute Video Presentation",
        duration: "10 mins",
      },
      {
        time: "2:25 – 2:40 pm",
        title: "Family Tributes",
        detail: "Children & grandchildren.",
        duration: "15 mins",
      },
      { time: "2:40 – 2:50 pm", title: "Friends’ Tribute", duration: "10 mins" },
      {
        time: "2:50 – 3:00 pm",
        title: "Toast to the Celebrant",
        duration: "10 mins",
      },
    ],
  },
  {
    numeral: "IV",
    name: "The Celebration",
    range: "3:00 – 3:30 pm",
    items: [
      {
        time: "3:00 – 3:15 pm",
        title: "Cutting of the 80th Birthday Cake",
        duration: "15 mins",
        accent: true,
      },
      {
        time: "3:15 – 3:20 pm",
        title: "Group Photograph",
        duration: "5 mins",
      },
      {
        time: "3:20 – 3:30 pm",
        title: "Ewi Presentation",
        detail: "A Yoruba poetic recital in the celebrant’s honour.",
        duration: "10 mins",
      },
    ],
  },
  {
    numeral: "V",
    name: "Feast & Festivity",
    range: "3:30 – 6:50 pm",
    items: [
      { time: "3:30 – 4:15 pm", title: "Lunch Service", duration: "45 mins" },
      {
        time: "4:15 – 4:25 pm",
        title: "Transition to Entertainment",
        duration: "10 mins",
      },
      {
        time: "4:25 – 6:50 pm",
        title: "Live Performance by Sir Shina Peters",
        detail:
          "A presentation of guests to the band, followed by an open dance floor.",
        duration: "2 hrs 25 mins",
        accent: true,
      },
    ],
  },
  {
    numeral: "VI",
    name: "Farewell",
    range: "6:50 – 7:00 pm",
    items: [
      {
        time: "6:50 – 7:00 pm",
        title: "Closing Prayer & Appreciation",
        detail: "A word of thanks from the family, and the departure of guests.",
        duration: "10 mins",
      },
    ],
  },
];

export default function ProgrammePage() {
  return (
    <ProgrammeDeck
      cover={{
        welcome: "Welcome",
        intro: "to the 80th Birthday Celebration of",
        name: honoree.fullName,
        honorific: honoree.honorific,
        ageLabel: "@80",
        dateLabel: formatDate(event.startsAt),
        timeLabel: "1:00 pm (WAT)",
        venue: event.venueName,
        portrait: "/images/cover-portrait.jpg",
      }}
      movements={MOVEMENTS}
      epigraph={honoree.epigraph}
    />
  );
}
