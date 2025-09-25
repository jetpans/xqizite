import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function randomAvatar(){
    const avatarProps = {
    avatarStyle: ["Circle"],
    topType: ["NoHair", "Eyepatch", "Hat", "Hijab", "Turban", "LongHairBigHair", "LongHairBob", "LongHairBun", "LongHairCurly", "LongHairCurvy", "LongHairDreads", "LongHairFrida", "LongHairFro", "LongHairShavedSides", "LongHairMiaWallace", "LongHairStraight", "LongHairStraight2", "LongHairStraightStrand", "ShortHairDreads01", "ShortHairDreads02", "ShortHairFrizzle", "ShortHairShaggyMullet", "ShortHairShortCurly", "ShortHairShortFlat", "ShortHairShortRound", "ShortHairShortWaved", "ShortHairSides", "ShortHairTheCaesar", "ShortHairTheCaesarSidePart"],
    accessoriesType: ["Blank", "Kurt", "Prescription01", "Prescription02", "Round", "Sunglasses", "Wayfarers"],
    hairColor: ["Auburn", "Black", "Blonde", "BlondeGolden", "Brown", "BrownDark", "PastelPink", "Platinum", "Red", "SilverGray"],
    facialHairType: ["Blank", "BeardLight", "BeardMedium", "BeardMajestic", "MoustacheFancy", "MoustacheMagnum"],
    facialHairColor: ["Auburn", "Black", "Blonde", "BlondeGolden", "Brown", "BrownDark", "Platinum", "Red"],
    clotheType: ["BlazerShirt", "BlazerSweater", "CollarSweater", "GraphicShirt", "Hoodie", "Overall", "ShirtCrewNeck", "ShirtScoopNeck", "ShirtVNeck"],
    clotheColor: ["Black", "Blue01", "Blue02", "Blue03", "Gray01", "Gray02", "Heather", "PastelBlue", "PastelGreen", "PastelOrange", "PastelRed", "PastelYellow", "Pink", "Red", "White"],
    eyeType: ["Close", "Cry", "Default", "Dizzy", "EyeRoll", "Happy", "Hearts", "Side", "Squint", "Surprised", "Wink", "WinkWacky"],
    eyebrowType: ["Angry", "AngryNatural", "Default", "DefaultNatural", "FlatNatural", "RaisedExcited", "RaisedExcitedNatural", "SadConcerned", "SadConcernedNatural", "UnibrowNatural", "UpDown", "UpDownNatural"],
    mouthType: ["Concerned", "Default", "Disbelief", "Eating", "Grimace", "Sad", "ScreamOpen", "Serious", "Smile", "Tongue", "Twinkle", "Vomit"],
    skinColor: ["Tanned", "Yellow", "Pale", "Light", "Brown", "DarkBrown", "Black"]
  };
  const getRandom = (arr:any) => arr[Math.floor(Math.random()*arr.length)];
  const params = Object.entries(avatarProps)
    .map(([key, values]) => `${key}=${getRandom(values)}`)
    .join("&");
  return `https://avataaars.io/?${params}`;

}

export const defaultAvatar = "https://avataaars.io/?avatarStyle=Circle&topType=Hat&accessoriesType=Sunglasses&facialHairType=MoustacheFancy&facialHairColor=Brown&clotheType=BlazerShirt&eyeType=Side&eyebrowType=AngryNatural&mouthType=Grimace&skinColor=Pale";

// avatarOptions.ts

export interface AvatarOptionField {
  label: string;
  values: string[];
}

export interface AvatarOptions {
  avatarStyle?: string;
  topType: string;
  accessoriesType: string;
  hairColor: string;
  facialHairType: string;
  facialHairColor: string;
  clotheType: string;
  clotheColor: string;
  eyeType: string;
  eyebrowType: string;
  mouthType: string;
  skinColor: string;
  // You can add more (e.g. hatColor, etc.) if needed
}

export const AVATAR_OPTION_FIELDS: { key: keyof AvatarOptions; field: AvatarOptionField }[] = [
  
  {
    key: "topType",
    field: {
      label: "Top / Hair Style",
      values: [
        "NoHair",
        "Eyepatch",
        "Hat",
        "Hijab",
        "Turban",
        "WinterHat1",
        "WinterHat2",
        "WinterHat3",
        "WinterHat4",
        "LongHairBigHair",
        "LongHairBob",
        "LongHairBun",
        "LongHairCurly",
        "LongHairCurvy",
        "LongHairDreads",
        "LongHairFrida",
        "LongHairFro",
        "LongHairFroBand",
        "LongHairNotTooLong",
        "LongHairShavedSides",
        "LongHairMiaWallace",
        "LongHairStraight",
        "LongHairStraight2",
        "LongHairStraightStrand",
        "ShortHairDreads01",
        "ShortHairDreads02",
        "ShortHairFrizzle",
        "ShortHairShaggyMullet",
        "ShortHairShortCurly",
        "ShortHairShortFlat",
        "ShortHairShortRound",
        "ShortHairShortWaved",
        "ShortHairSides",
        "ShortHairTheCaesar",
        "ShortHairTheCaesarSidePart",
      ],
    },
  },
  {
    key: "accessoriesType",
    field: {
      label: "Accessories",
      values: [
        "Blank",
        "Kurt",
        "Prescription01",
        "Prescription02",
        "Round",
        "Sunglasses",
        "Wayfarers",
      ],
    },
  },
  {
    key: "hairColor",
    field: {
      label: "Hair Color",
      values: [
        "Auburn",
        "Black",
        "Blonde",
        "BlondeGolden",
        "Brown",
        "BrownDark",
        "PastelPink",
        "Blue",
        "Platinum",
        "Red",
        "SilverGray",
      ],
    },
  },
  {
    key: "facialHairType",
    field: {
      label: "Facial Hair",
      values: [
        "Blank",
        "BeardMedium",
        "BeardLight",
        "Majestic",
        "MoustacheFancy",
        "MoustacheMagnum",
      ],
    },
  },
  {
    key: "facialHairColor",
    field: {
      label: "Facial Hair Color",
      values: [
        "Auburn",
        "Black",
        "Blonde",
        "BlondeGolden",
        "Brown",
        "BrownDark",
        "PastelPink",
        "Blue",
        "Platinum",
        "Red",
        "SilverGray",
      ],
    },
  },
  {
    key: "clotheType",
    field: {
      label: "Clothing Type",
      values: [
        "BlazerShirt",
        "BlazerSweater",
        "CollarSweater",
        "GraphicShirt",
        "Hoodie",
        "Overall",
        "ShirtCrewNeck",
        "ShirtScoopNeck",
        "ShirtVNeck",
      ],
    },
  },
  {
    key: "clotheColor",
    field: {
      label: "Clothing Color",
      values: [
        "Black",
        "Blue01",
        "Blue02",
        "Blue03",
        "Gray01",
        "Gray02",
        "Heather",
        "PastelBlue",
        "PastelGreen",
        "PastelOrange",
        "PastelRed",
        "PastelYellow",
        "Pink",
        "Red",
        "White",
      ],
    },
  },
  {
    key: "eyeType",
    field: {
      label: "Eyes",
      values: [
        "Close",
        "Cry",
        "Default",
        "Dizzy",
        "EyeRoll",
        "Happy",
        "Hearts",
        "Side",
        "Squint",
        "Surprised",
        "Wink",
        "WinkWacky",
      ],
    },
  },
  {
    key: "eyebrowType",
    field: {
      label: "Eyebrow",
      values: [
        "Angry",
        "AngryNatural",
        "Default",
        "DefaultNatural",
        "FlatNatural",
        "RaisedExcited",
        "RaisedExcitedNatural",
        "SadConcerned",
        "SadConcernedNatural",
        "UnibrowNatural",
        "UpDown",
        "UpDownNatural",
      ],
    },
  },
  {
    key: "mouthType",
    field: {
      label: "Mouth",
      values: [
        "Concerned",
        "Default",
        "Disbelief",
        "Eating",
        "Grimace",
        "Sad",
        "ScreamOpen",
        "Serious",
        "Smile",
        "Tongue",
        "Twinkle",
        "Vomit",
      ],
    },
  },
  {
    key: "skinColor",
    field: {
      label: "Skin Color",
      values: [
        "Tanned",
        "Yellow",
        "Pale",
        "Light",
        "Brown",
        "DarkBrown",
        "Black",
      ],
    },
  },
];

export function buildAvatarUrl(opts: AvatarOptions) {
  const params = new URLSearchParams();

  // For each key in opts, add as query param
  (Object.keys(opts) as (keyof AvatarOptions)[]).forEach((key) => {
    const value = opts[key];
    if (value != null) {
      params.set(key, value);
    }
  });

  // Use avataaars endpoint — you might use getavataaars or avataaars.io
  return `https://avataaars.io/?${params.toString()}`;
}